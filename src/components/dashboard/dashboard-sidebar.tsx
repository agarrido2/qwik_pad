/**
 * Dashboard Sidebar - Navegación principal del dashboard
 *
 * Estructura vertical fija (left-0, top-0, h-screen) con 4 secciones:
 * 1. Logo/Org name (h-16)
 * 2. User + Workspace info (py-4)
 * 3. Menu items con active state detection (flex-1)
 * 4. Footer con Workspace menu + Logout (py-4)
 *
 * RBAC 2026-02-15:
 * - Menu filtrado por rol usando menu.config.ts (source of truth)
 * - AuthContext provee user + org + roleLabel/roleBadgeColor
 * - ZERO lógica de permisos manual en el componente
 *
 * MULTI-NIVEL 2026-02-16:
 * - Soporta grupos expandibles (items con `children`)
 * - useStore para estado de expand/collapse (Record<text, boolean>)
 * - Auto-expand si un hijo está activo
 * - Separadores visuales (`dividerAfter`)
 * - Renderizado recursivo con `renderMenuItem()`
 * - Indentación pl-8 para hijos, chevron rotable para padres
 *
 * COLLAPSE 2026-02-17:
 * - Mobile (<1024px): overlay (translate-x)
 * - Desktop (≥1024px): colapsa a w-16 (solo iconos + tooltips)
 * - Estado desde SidebarContext (isOpen, isCollapsed)
 * - Cierra mobile al navegar (closeMobile en Link)
 *
 * Colores: Sistema HSL (bg-card, border-border, text-foreground)
 */

import { component$, useContext, useStore } from '@builder.io/qwik';
import { Form, Link, useLocation } from '@builder.io/qwik-city';
import { cn } from '~/lib/utils/cn';
import { AuthContext } from '~/lib/context/auth.context';
import { SidebarContext } from '~/lib/context/sidebar.context';
import { getVisibleMenu, type ResolvedMenuItem } from '~/lib/config/menu.config';
import { useLogoutAction } from '~/routes/(app)/dashboard/layout';
import { IconMap } from '~/components/icons/dashboard-icons';
import { OrgSwitcher } from './org-switcher';

export const DashboardSidebar = component$(() => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const sidebar = useContext(SidebarContext);
  const logoutAction = useLogoutAction();

  const mainMenu = getVisibleMenu(auth.organization.role, 'main');
  const workspaceMenu = getVisibleMenu(auth.organization.role, 'workspace');

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') {
      return location.url.pathname === '/dashboard' ||
             location.url.pathname === '/dashboard/';
    }
    return location.url.pathname.startsWith(href);
  };

  const expandedGroups = useStore<Record<string, boolean>>({});

  for (const item of [...mainMenu, ...workspaceMenu]) {
    if (item.children?.some((c) => c.href && isActive(c.href))) {
      expandedGroups[item.text] = true;
    }
  }

  const renderIcon = (iconName: string) => {
    return IconMap[iconName] ?? IconMap.home;
  };

  const renderMenuItem = (item: ResolvedMenuItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups[item.text] ?? false;
    const collapsed = sidebar.isCollapsed.value;

    // ── Grupo expandible ────────────────────────────────────────────────────
    if (hasChildren) {
      return (
        <div key={item.text}>
          <button
            onClick$={() => {
              // En collapsed no expandir grupos, solo navegar al primer hijo
              if (!collapsed) {
                expandedGroups[item.text] = !expandedGroups[item.text];
              }
            }}
            class={cn(
              'group relative flex w-full items-center px-3 py-2.5 rounded-md',
              'text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed ? 'justify-center px-0' : 'gap-3'
            )}
            aria-expanded={collapsed ? undefined : isExpanded}
            aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} ${item.text}`}
          >
            {/* Icono siempre visible */}
            <span class="shrink-0">
              {renderIcon(item.icon)}
            </span>

            {/* Label (oculto en collapsed) */}
            <span class={cn(
              'sidebar-item-label text-left',
              collapsed ? 'w-0 opacity-0' : 'flex-1'
            )}>
              {item.text}
            </span>

            {/* Chevron (oculto en collapsed) */}
            {!collapsed && (
              <span class={cn(
                'shrink-0 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}>
                {IconMap.chevron}
              </span>
            )}

            {/* Tooltip (solo visible en collapsed) */}
            {collapsed && (
              <span class="sidebar-tooltip">{item.text}</span>
            )}
          </button>

          {/* Hijos (solo visibles si expandido Y no collapsed) */}
          {isExpanded && !collapsed && (
            <div class="ml-4 mt-1 space-y-1" role="group">
              {item.children!.map((child) => (
                <Link
                  key={child.href ?? child.text}
                  href={child.href!}
                  onClick$={sidebar.closeMobile}
                  class={cn(
                    'flex items-center gap-3 px-3 py-2.5 pl-8 rounded-md',
                    'text-sm font-medium transition-colors',
                    isActive(child.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive(child.href) ? 'page' : undefined}
                >
                  <span class="shrink-0 text-muted-foreground/60">
                    {renderIcon(child.icon)}
                  </span>
                  <span class="flex-1">{child.text}</span>
                  {child.badge !== undefined && child.badge > 0 && (
                    <span class="badge-error">{child.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {item.dividerAfter && <hr class="my-2 border-border" />}
        </div>
      );
    }

    // ── Link directo ────────────────────────────────────────────────────────
    return (
      <div key={item.href ?? item.text}>
        <Link
          href={item.href!}
          onClick$={sidebar.closeMobile}
          class={cn(
            'group relative flex items-center px-3 py-2.5 rounded-md',
            'text-sm font-medium transition-colors',
            isChild && 'pl-8',
            collapsed ? 'justify-center px-0' : 'gap-3',
            isActive(item.href)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {/* Icono siempre visible */}
          <span class={cn(
            'shrink-0',
            isChild && 'text-muted-foreground/60'
          )}>
            {renderIcon(item.icon)}
          </span>

          {/* Label (oculto en collapsed) */}
          <span class={cn(
            'sidebar-item-label',
            collapsed ? 'w-0 opacity-0' : 'flex-1'
          )}>
            {item.text}
          </span>

          {/* Badge (oculto en collapsed) */}
          {!collapsed && item.badge !== undefined && item.badge > 0 && (
            <span class="badge-error">{item.badge}</span>
          )}

          {/* Tooltip (solo visible en collapsed) */}
          {collapsed && (
            <span class="sidebar-tooltip">{item.text}</span>
          )}
        </Link>

        {item.dividerAfter && <hr class="my-2 border-border" />}
      </div>
    );
  };

  return (
    <aside
      class={cn(
        // Base
        'fixed left-0 top-0 h-screen flex flex-col z-30',
        'bg-card border-r border-border',
        'transition-all duration-300',
        // Mobile: visible/oculto con translate
        sidebar.isOpen.value
          ? 'translate-x-0'
          : '-translate-x-full lg:translate-x-0',
        // Desktop: ancho dinámico
        sidebar.isCollapsed.value
          ? 'w-16'
          : 'w-72'
      )}
      aria-label="Navegación del dashboard"
    >
      {/* 1. LOGO/ORG NAME ─────────────────────────────────────────────────── */}
      <div class={cn(
        'h-16 flex items-center border-b border-border shrink-0',
        'transition-all duration-300',
        sidebar.isCollapsed.value
          ? 'justify-center px-2'
          : 'justify-between px-6'
      )}>
        {/* Logo/Nombre org (oculto en collapsed) */}
        {!sidebar.isCollapsed.value && (
          <h2 class="text-xl font-bold text-primary truncate">
            {auth.organization.name}
          </h2>
        )}

        {/* Botón toggle collapse (desktop) */}
        <button
          onClick$={sidebar.toggleCollapse}
          class="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shrink-0"
          aria-label={sidebar.isCollapsed.value
            ? 'Expandir sidebar'
            : 'Colapsar sidebar'
          }
        >
          {/* Chevron izquierda/derecha según estado */}
          <span class={cn(
            'transition-transform duration-300',
            sidebar.isCollapsed.value && 'rotate-180'
          )}>
            {IconMap.chevronLeft}
          </span>
        </button>
      </div>

      {/* 2. WORKSPACE INFO (oculto en collapsed) ────────────────────────── */}
      {!sidebar.isCollapsed.value && (
        <div class="py-4 px-4 border-b border-border shrink-0">
          <OrgSwitcher />
        </div>
      )}

      {/* 3. MENU PRINCIPAL ───────────────────────────────────────────────── */}
      <nav class={cn(
        'flex-1 overflow-y-auto py-4 transition-all duration-300',
        sidebar.isCollapsed.value ? 'px-1' : 'px-3'
      )}
        role="navigation"
      >
        <div class="space-y-1">
          {mainMenu.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      {/* 4. FOOTER — Workspace + Soporte + Logout ───────────────────────── */}
      <div class={cn(
        'border-t border-border space-y-1 shrink-0',
        'transition-all duration-300',
        sidebar.isCollapsed.value ? 'py-4 px-1' : 'py-4 px-3'
      )}>
        {workspaceMenu.map((item) => renderMenuItem(item))}

        {/* Soporte */}
        <button
          class={cn(
            'group relative flex w-full items-center px-3 py-2.5 rounded-md',
            'text-sm font-medium text-muted-foreground',
            'hover:bg-accent hover:text-accent-foreground transition-colors',
            sidebar.isCollapsed.value ? 'justify-center px-0' : 'gap-3'
          )}
          aria-label="Contactar soporte"
        >
          <span class="shrink-0">{renderIcon('support')}</span>
          <span class={cn(
            'sidebar-item-label',
            sidebar.isCollapsed.value && 'w-0 opacity-0'
          )}>
            Soporte
          </span>
          {sidebar.isCollapsed.value && (
            <span class="sidebar-tooltip">Soporte</span>
          )}
        </button>

        {/* Logout */}
        <Form action={logoutAction}>
          <button
            type="submit"
            class={cn(
              'group relative flex w-full items-center px-3 py-2.5 rounded-md',
              'text-sm font-medium text-error',
              'hover:bg-error/10 transition-colors',
              sidebar.isCollapsed.value ? 'justify-center px-0' : 'gap-3'
            )}
            aria-label="Cerrar sesión"
          >
            <span class="shrink-0">{renderIcon('logout')}</span>
            <span class={cn(
              'sidebar-item-label',
              sidebar.isCollapsed.value && 'w-0 opacity-0'
            )}>
              Cerrar sesión
            </span>
            {sidebar.isCollapsed.value && (
              <span class="sidebar-tooltip">Cerrar sesión</span>
            )}
          </button>
        </Form>
      </div>
    </aside>
  );
});