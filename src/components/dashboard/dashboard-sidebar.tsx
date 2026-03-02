/**
 * Dashboard Sidebar - Navegación principal del dashboard
 *
 * Estructura vertical fija (left-0, top-0, h-screen) con 4 secciones:
 * 1. Logo/Org name (h-16)
 * 2. User + Workspace info (py-4)
 * 3. Menu items con active state detection (flex-1)
 * 4. Footer con Workspace menu + Logout (py-4)
 *
 * RBAC + Optimización 2026-03-01:
 * - Menús derivados con useComputed$ por rol (sin recomputar en cada render).
 * - Item y Group separados para reducir complejidad del componente raíz.
 * - Estado de expansión encapsulado por grupo para minimizar re-render global.
 * - Cero lógica de permisos manual (SSOT: menu.config.ts).
 */

import {
  component$,
  useComputed$,
  useContext,
  useSignal,
  useTask$,
  type QRL,
} from "@builder.io/qwik";
import { Form, Link, useLocation } from "@builder.io/qwik-city";
import { cn } from "~/lib/utils/cn";
import { AuthContext } from "~/lib/context/auth.context";
import { SidebarContext } from "~/lib/context/sidebar.context";
import {
  getVisibleMenu,
  type MenuItem,
  type ResolvedMenuItem,
} from "~/lib/config/menu.config";
import { useLogoutAction } from "~/routes/(app)/dashboard/layout";
import { IconMap } from "~/components/icons/dashboard-icons";
import { Badge } from "~/components/ui";
import { OrgSwitcher } from "./org-switcher";

// Coincide con la duración de la transición CSS de grid-rows (ms)
const FOCUS_DELAY_MS = 310;

// Exact-match para /dashboard para evitar activar el item raíz
// en todas las sub-rutas (/dashboard/agentes, /dashboard/agenda…)
const isLinkActive = (pathname: string, href?: string) => {
  if (!href) return false;
  if (href === "/dashboard" || href === "/dashboard/") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname.startsWith(href);
};

const renderIcon = (iconName: string) => IconMap[iconName] ?? IconMap.home;

interface SidebarItemProps {
  item: MenuItem;
  pathname: string;
  collapsed: boolean;
  closeMobile: QRL<() => void>;
  isChild?: boolean;
}

export const SidebarItem = component$<SidebarItemProps>((props) => {
  const active = useComputed$(() =>
    isLinkActive(props.pathname, props.item.href),
  );

  return (
    <div>
      <Link
        href={props.item.href!}
        onClick$={props.closeMobile}
        class={cn(
          "group relative flex items-center rounded-md px-3 py-2.5",
          "text-sm font-medium transition-colors",
          props.isChild && "pl-8",
          props.collapsed ? "justify-center px-0" : "gap-3",
          active.value
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        aria-current={active.value ? "page" : undefined}
      >
        <span
          class={cn("shrink-0", props.isChild && "text-muted-foreground/60")}
        >
          {renderIcon(props.item.icon)}
        </span>

        <span
          class={cn(
            "sidebar-item-label",
            props.collapsed ? "w-0 opacity-0" : "flex-1",
          )}
        >
          {props.item.text}
        </span>

        {!props.collapsed &&
          props.item.badge !== undefined &&
          props.item.badge > 0 && (
            <Badge variant="error">{props.item.badge}</Badge>
          )}

        {props.collapsed && (
          <span class="sidebar-tooltip">{props.item.text}</span>
        )}
      </Link>

      {props.item.dividerAfter && <hr class="border-border my-2" />}
    </div>
  );
});

interface SidebarGroupProps {
  item: ResolvedMenuItem;
  pathname: string;
  collapsed: boolean;
  closeMobile: QRL<() => void>;
}

export const SidebarGroup = component$<SidebarGroupProps>((props) => {
  const isGroupActive = useComputed$(
    () =>
      props.item.children?.some((child) =>
        isLinkActive(props.pathname, child.href),
      ) ?? false,
  );
  // Inicializar expandido si ya hay un hijo activo (SSR-safe: valor sincrónico)
  const isExpanded = useSignal<boolean>(isGroupActive.value);

  useTask$(({ track }) => {
    track(() => props.pathname);
    if (isGroupActive.value) {
      isExpanded.value = true;
    }
  });

  return (
    <div>
      <button
        onClick$={() => {
          if (props.collapsed) return;
          const opening = !isExpanded.value;
          isExpanded.value = opening;
          if (opening) {
            // Espera a que finalice la animación grid-rows antes de poner foco
            setTimeout(() => {
              const firstLink = document.querySelector<HTMLElement>(
                `[data-group="${props.item.text}"] a`,
              );
              firstLink?.focus();
            }, FOCUS_DELAY_MS);
          }
        }}
        class={cn(
          "group relative flex w-full items-center rounded-md px-3 py-2.5",
          "text-sm font-medium transition-colors",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          props.collapsed ? "justify-center px-0" : "gap-3",
        )}
        aria-expanded={props.collapsed ? undefined : isExpanded.value}
        aria-label={`${isExpanded.value ? "Colapsar" : "Expandir"} ${props.item.text}`}
      >
        <span class="shrink-0">{renderIcon(props.item.icon)}</span>

        <span
          class={cn(
            "sidebar-item-label text-left",
            props.collapsed ? "w-0 opacity-0" : "flex-1",
          )}
        >
          {props.item.text}
        </span>

        {!props.collapsed && (
          <span
            class={cn(
              "shrink-0 transition-transform duration-200",
              isExpanded.value && "rotate-90",
            )}
          >
            {IconMap.chevron}
          </span>
        )}

        {props.collapsed && (
          <span class="sidebar-tooltip">{props.item.text}</span>
        )}
      </button>

      {/* grid-rows: transición de 0fr→1fr permite animar height sin JS.
           El <div class="overflow-hidden"> interior actúa como contenedor.
           Requiere Tailwind v4 con soporte de valores arbitrarios en grid-rows. */}
      {!props.collapsed && (
        <div
          data-group={props.item.text}
          role="group"
          aria-hidden={!isExpanded.value}
          class={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
            isExpanded.value
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div class="overflow-hidden">
            <div class="mt-1 ml-4 space-y-1 pb-1">
              {props.item.children?.map((child) => (
                <SidebarItem
                  key={child.href ?? child.text}
                  item={child}
                  pathname={props.pathname}
                  collapsed={props.collapsed}
                  closeMobile={props.closeMobile}
                  isChild={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {props.item.dividerAfter && <hr class="border-border my-2" />}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SidebarStaticActions — Soporte + Logout (acciones fijas fuera del menú RBAC)
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarStaticActionsProps {
  collapsed: boolean;
}

export const SidebarStaticActions = component$<SidebarStaticActionsProps>(
  (props) => {
    // useLogoutAction es un routeAction$ registrado en /dashboard/layout.tsx;
    // puede invocarse desde cualquier componente dentro de esa ruta.
    const logoutAction = useLogoutAction();

    return (
      <>
        <button
          class={cn(
            "group relative flex w-full items-center rounded-md px-3 py-2.5",
            "text-muted-foreground text-sm font-medium",
            "hover:bg-accent hover:text-accent-foreground transition-colors",
            props.collapsed ? "justify-center px-0" : "gap-3",
          )}
          aria-label="Contactar soporte"
        >
          <span class="shrink-0">{IconMap["support"] ?? IconMap.home}</span>
          <span
            class={cn("sidebar-item-label", props.collapsed && "w-0 opacity-0")}
          >
            Soporte
          </span>
          {props.collapsed && <span class="sidebar-tooltip">Soporte</span>}
        </button>

        <Form action={logoutAction}>
          <button
            type="submit"
            class={cn(
              "group relative flex w-full items-center rounded-md px-3 py-2.5",
              "text-error text-sm font-medium",
              "hover:bg-error/10 transition-colors",
              props.collapsed ? "justify-center px-0" : "gap-3",
            )}
            aria-label="Cerrar sesión"
          >
            <span class="shrink-0">{IconMap["logout"] ?? IconMap.home}</span>
            <span
              class={cn(
                "sidebar-item-label",
                props.collapsed && "w-0 opacity-0",
              )}
            >
              Cerrar sesión
            </span>
            {props.collapsed && (
              <span class="sidebar-tooltip">Cerrar sesión</span>
            )}
          </button>
        </Form>
      </>
    );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// DashboardSidebar — Orquestador: ensambla zonas, no declara lógica propia
// ─────────────────────────────────────────────────────────────────────────────

export const DashboardSidebar = component$(() => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const sidebar = useContext(SidebarContext);

  const role = useComputed$(() => auth.organization.role);
  const pathname = useComputed$(() => location.url.pathname);

  const mainMenu = useComputed$(() => getVisibleMenu(role.value, "main"));
  const workspaceMenu = useComputed$(() =>
    getVisibleMenu(role.value, "workspace"),
  );

  return (
    <aside
      class={cn(
        "bg-background fixed top-0 left-0 z-30 flex h-screen flex-col",
        "transition-all duration-300",
        sidebar.isOpen.value
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0",
        sidebar.isCollapsed.value ? "w-16" : "w-72",
      )}
      aria-label="Navegación del dashboard"
    >
      {/* Zona 1: selector de organización y cabecera (h-16 = misma altura que header) */}
      <div
        class={cn(
          "flex h-16 shrink-0 items-center",
          "transition-[padding] duration-300",
          sidebar.isCollapsed.value ? "px-2" : "px-4",
        )}
      >
        <OrgSwitcher collapsed={sidebar.isCollapsed.value} />
      </div>

      <nav
        class={cn(
          "flex-1 overflow-x-hidden overflow-y-auto pt-12 pb-4 transition-all duration-300",
          sidebar.isCollapsed.value ? "px-1" : "px-3",
        )}
        role="navigation"
      >
        <div class="space-y-1">
          {mainMenu.value.map((item) =>
            item.children && item.children.length > 0 ? (
              <SidebarGroup
                key={item.text}
                item={item}
                pathname={pathname.value}
                collapsed={sidebar.isCollapsed.value}
                closeMobile={sidebar.closeMobile}
              />
            ) : (
              <SidebarItem
                key={item.href ?? item.text}
                item={item}
                pathname={pathname.value}
                collapsed={sidebar.isCollapsed.value}
                closeMobile={sidebar.closeMobile}
              />
            ),
          )}
        </div>
      </nav>

      <div
        class={cn(
          "space-y-1 overflow-x-hidden overflow-y-visible",
          "transition-all duration-300",
          sidebar.isCollapsed.value ? "px-1 py-4" : "px-3 py-4",
        )}
      >
        {workspaceMenu.value.map((item) =>
          item.children && item.children.length > 0 ? (
            <SidebarGroup
              key={item.text}
              item={item}
              pathname={pathname.value}
              collapsed={sidebar.isCollapsed.value}
              closeMobile={sidebar.closeMobile}
            />
          ) : (
            <SidebarItem
              key={item.href ?? item.text}
              item={item}
              pathname={pathname.value}
              collapsed={sidebar.isCollapsed.value}
              closeMobile={sidebar.closeMobile}
            />
          ),
        )}

        {/* Zona 4b: acciones estáticas fuera del menú RBAC (soporte + logout) */}
        <SidebarStaticActions collapsed={sidebar.isCollapsed.value} />
      </div>
    </aside>
  );
});
