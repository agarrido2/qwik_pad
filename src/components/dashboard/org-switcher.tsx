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

import { component$, useContext, useSignal } from '@builder.io/qwik';
import { server$ } from '@builder.io/qwik-city';
import { AuthContext } from '~/lib/context/auth.context';
import { cn } from '~/lib/utils/cn';
import { Avatar } from '~/components/ui';
import { ACTIVE_ORG_COOKIE_NAME } from '~/lib/auth/active-org';

/**
 * RPC ligero: solo setea cookie HTTP-only.
 * 0 DB queries — la seguridad se aplica en lectura (resolveActiveOrg + RLS).
 */
const persistActiveOrg = server$(function (orgId: string) {
  this.cookie.set(ACTIVE_ORG_COOKIE_NAME, orgId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: this.url.protocol === 'https:',
    maxAge: 60 * 60 * 24 * 365,
  });
});

/**
 * Dropdown de selección de organización activa para el sidebar.
 */
export const OrgSwitcher = component$(() => {
  const auth = useContext(AuthContext);
  const isOpen = useSignal(false);

  return (
    <div class="relative">
      <button
        type="button"
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
        class="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-neutral-50 transition-colors"
        aria-label="Seleccionar organización activa"
        aria-expanded={isOpen.value}
      >
        <Avatar name={auth.organization.name} size="md" />

        <div class="flex-1 min-w-0 text-left">
          <p class="text-sm font-medium text-neutral-900 truncate">
            {auth.organization.name}
          </p>
          <div class="flex items-center gap-2">
            <span class={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              auth.organization.roleBadgeColor,
            )}>
              {auth.organization.roleLabel}
            </span>

            {auth.isPreviewMode && (
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Demo
              </span>
            )}
          </div>
        </div>

        <svg
          class={cn(
            'h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200',
            isOpen.value && 'rotate-180',
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
      </button>

      {isOpen.value && (
        <>
          <button
            type="button"
            class="fixed inset-0 z-30"
            aria-label="Cerrar selector de organización"
            onClick$={() => {
              isOpen.value = false;
            }}
          />

          <div
            class="absolute left-0 right-0 top-full mt-2 z-40 rounded-md border border-neutral-200 bg-white shadow-lg p-1"
            role="listbox"
            aria-label="Organizaciones disponibles"
          >
            {auth.allOrganizations.map((organization) => {
              const isActive = organization.id === auth.organization.id;

              return (
                <button
                  key={organization.id}
                  type="button"
                  disabled={isActive}
                  role="option"
                  aria-selected={isActive}
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
                    auth.isPreviewMode = organization.subscriptionTier === 'free';
                    isOpen.value = false;

                    // ★ Persist cookie server-side (fire-and-forget RPC, 0 DB queries)
                    persistActiveOrg(organization.id);
                  }}
                  class={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 cursor-default'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
                  )}
                >
                  <span class="w-4 text-xs font-semibold" aria-hidden="true">
                    {isActive ? '✓' : ''}
                  </span>

                  <Avatar name={organization.name} size="sm" color="neutral" />

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">
                      {organization.name}
                    </p>
                    <p class="text-xs text-neutral-500 truncate">
                      {organization.roleLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});
