/**
 * Org Switcher - Selector de organización activa (multi-tenant)
 *
 * Renderiza la organización activa y un dropdown con todas las organizaciones
 * disponibles para el usuario.
 *
 * Patrón: Optimistic Update + server$() RPC.
 * - UI se actualiza instantáneamente mutando el AuthContext store.
 * - Cookie HTTP-only se persiste en background vía server$() (0 DB queries).
 * - Seguridad: cookie validada en lectura por resolveActiveOrg + RLS.
 */

import { component$, useContext, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { AuthContext } from "~/lib/context/auth.context";
import { cn } from "~/lib/utils/cn";
import { Avatar, Badge, Dropdown, DropdownItem } from "~/components/ui";
import { ACTIVE_ORG_COOKIE_NAME } from "~/lib/auth/active-org";

/**
 * RPC ligero: solo setea cookie HTTP-only.
 * 0 DB queries — la seguridad se aplica en lectura (resolveActiveOrg + RLS).
 */
const persistActiveOrg = server$(function (orgId: string) {
  this.cookie.set(ACTIVE_ORG_COOKIE_NAME, orgId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: this.url.protocol === "https:",
    maxAge: 60 * 60 * 24 * 365,
  });
});

/**
 * Dropdown de selección de organización activa para el sidebar.
 */
export const OrgSwitcher = component$<{ collapsed?: boolean }>((props) => {
  const auth = useContext(AuthContext);
  const isOpen = useSignal(false);

  return (
    <Dropdown
      align="left"
      width={props.collapsed ? "w-60" : "w-full"}
      mode="listbox"
      panelAriaLabel="Organizaciones disponibles"
      panelClass="p-1"
      openSignal={isOpen}
    >
      <button
        q:slot="trigger"
        type="button"
        class={cn(
          "text-foreground hover:bg-accent flex items-center rounded-md transition-colors",
          props.collapsed
            ? "h-12 w-12 justify-center"
            : "w-full gap-3 px-2 py-2",
        )}
        aria-label="Seleccionar organización activa"
        aria-expanded={isOpen.value}
      >
        <Avatar
          name={auth.organization.name}
          size={props.collapsed ? "sm" : "md"}
        />

        {!props.collapsed && (
          <>
            <div class="min-w-0 flex-1 text-left">
              <p class="truncate text-sm font-medium text-black dark:text-white">
                {auth.organization.name}
              </p>
              <div class="flex items-center gap-2">
                <span
                  class={cn(
                    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
                    auth.organization.roleBadgeColor,
                  )}
                >
                  {auth.organization.roleLabel}
                </span>

                {auth.isPreviewMode && (
                  <Badge variant="warning" class="px-2 py-0.5">
                    Demo
                  </Badge>
                )}
              </div>
            </div>

            <svg
              class={cn(
                "text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200",
                isOpen.value && "rotate-180",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {auth.allOrganizations.map((organization) => {
        const isActive = organization.id === auth.organization.id;

        return (
          <DropdownItem
            key={organization.id}
            disabled={isActive}
            selected={isActive}
            onClick$={() => {
              if (isActive) return;

              // ★ Optimistic update — UI instantánea (0ms)
              auth.organization = {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                subscriptionTier: organization.subscriptionTier,
                sector: organization.sector,
                role: organization.role,
                roleLabel: organization.roleLabel,
                roleBadgeColor: organization.roleBadgeColor,
              };
              auth.isPreviewMode = organization.subscriptionTier === "free";

              // ★ Persist cookie server-side (fire-and-forget RPC, 0 DB queries)
              persistActiveOrg(organization.id);
            }}
            class={cn(
              "w-full rounded-md px-2 py-2 text-left",
              isActive
                ? "bg-primary/10 text-primary cursor-default"
                : "text-foreground hover:bg-accent",
            )}
          >
            <span class="w-4 text-xs font-semibold" aria-hidden="true">
              {isActive ? "✓" : ""}
            </span>

            <Avatar name={organization.name} size="sm" color="neutral" />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{organization.name}</p>
              <p class="text-muted-foreground truncate text-xs">
                {organization.roleLabel}
              </p>
            </div>
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
});
