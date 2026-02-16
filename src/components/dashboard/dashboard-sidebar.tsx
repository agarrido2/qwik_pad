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
 * Mobile: Implementar collapse/hamburger < 768px en futuras iteraciones
 */

import { component$, useContext, useStore } from '@builder.io/qwik';
import { Form, Link, useLocation } from '@builder.io/qwik-city';
import { cn } from '~/lib/utils/cn';
import { AuthContext } from '~/lib/context/auth.context';
import { getVisibleMenu, type ResolvedMenuItem } from '~/lib/config/menu.config';
import { useLogoutAction } from '~/routes/(app)/dashboard/layout';
import { IconMap } from '~/components/icons/dashboard-icons';
import { OrgSwitcher } from './org-switcher';

export const DashboardSidebar = component$(() => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const logoutAction = useLogoutAction();

  // Menu filtrado por rol — source of truth en menu.config.ts
  const mainMenu = getVisibleMenu(auth.organization.role, 'main');
  const workspaceMenu = getVisibleMenu(auth.organization.role, 'workspace');

  /**
   * Helper: Detecta si la ruta actual matchea el href del menu item
   * Usa pathname exacto para evitar falsos positivos
   */
  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/dashboard') {
      return location.url.pathname === '/dashboard' || location.url.pathname === '/dashboard/';
    }
    return location.url.pathname.startsWith(href);
  };

  // Estado para grupos expandidos (Record<text, isExpanded>)
  const expandedGroups = useStore<Record<string, boolean>>({});

  // Auto-expand: si un hijo está activo, expandir su padre
  for (const item of [...mainMenu, ...workspaceMenu]) {
    if (item.children?.some((c) => c.href && isActive(c.href))) {
      expandedGroups[item.text] = true;
    }
  }

  /**
   * Helper: Renderiza item de menú (link directo o grupo expandible)
   */
  const renderMenuItem = (item: ResolvedMenuItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups[item.text] ?? false;

    // Caso 1: Grupo expandible (tiene hijos)
    if (hasChildren) {
      return (
        <div key={item.text}>
          <button
            onClick$={() => {
              expandedGroups[item.text] = !expandedGroups[item.text];
            }}
            class={cn(
              'flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            )}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} ${item.text}`}
          >
            <span class="shrink-0">{renderIcon(item.icon)}</span>
            <span class="flex-1 text-left">{item.text}</span>
            <span
              class={cn(
                'shrink-0 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
            >
              {IconMap.chevron}
            </span>
          </button>

          {/* Hijos (nivel 2) */}
          {isExpanded && (
            <div class="ml-4 mt-1 space-y-1" role="group">
              {item.children!.map((child) => (
                <Link
                  key={child.href ?? child.text}
                  href={child.href!}
                  class={cn(
                    'flex items-center gap-3 px-3 py-2.5 pl-8 rounded-md text-sm font-medium transition-colors',
                    isActive(child.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                  aria-current={isActive(child.href) ? 'page' : undefined}
                >
                  <span class="shrink-0 text-neutral-400">{renderIcon(child.icon)}</span>
                  <span class="flex-1">{child.text}</span>
                  {child.badge !== undefined && child.badge > 0 && (
                    <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {child.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Separador después del grupo */}
          {item.dividerAfter && <hr class="my-2 border-neutral-200" />}
        </div>
      );
    }

    // Caso 2: Link directo (sin hijos)
    return (
      <div key={item.href ?? item.text}>
        <Link
          href={item.href!}
          class={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
            isChild && 'pl-8',
            isActive(item.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
          )}
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          <span class={cn('shrink-0', isChild && 'text-neutral-400')}>
            {renderIcon(item.icon)}
          </span>
          <span class="flex-1">{item.text}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {item.badge}
            </span>
          )}
        </Link>

        {/* Separador después del item */}
        {item.dividerAfter && <hr class="my-2 border-neutral-200" />}
      </div>
    );
  };

  /**
   * Helper: Renderiza el icono desde el map
   * Fallback a un icono genérico si no existe
   */
  const renderIcon = (iconName: string) => {
    return IconMap[iconName] ?? IconMap.home;
  };

  return (
    <aside
      class="fixed left-0 top-0 h-screen w-72 bg-white border-r border-neutral-200 flex flex-col z-30"
      aria-label="Navegación del dashboard"
    >
      {/* 1. SECCIÓN LOGO/ORG NAME */}
      <div class="h-16 px-6 flex items-center border-b border-neutral-200">
        <h2 class="text-xl font-family-roboto font-bold text-primary-600 truncate">
          {auth.organization.name}
        </h2>
      </div>

      {/* 2. SECCIÓN WORKSPACE INFO */}
      <div class="py-4 px-4 border-b border-neutral-200">
        <OrgSwitcher />
      </div>

      {/* 3. SECCIÓN MENU PRINCIPAL — filtrado por rol automáticamente */}
      <nav class="flex-1 overflow-y-auto py-4 px-3" role="navigation">
        <div class="space-y-1">
          {mainMenu.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      {/* 4. SECCIÓN FOOTER — Workspace menu (filtrado por rol) + Logout */}
      <div class="py-4 px-3 border-t border-neutral-200 space-y-1">
        {workspaceMenu.map((item) => renderMenuItem(item))}

        {/* Botón Soporte */}
        <button
          class="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          aria-label="Contactar soporte"
        >
          <span class="shrink-0">{renderIcon('support')}</span>
          <span>Soporte</span>
        </button>

        {/* Botón Logout */}
        <Form action={logoutAction}>
          <button
            type="submit"
            class="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Cerrar sesión"
          >
            <span class="shrink-0">{renderIcon('logout')}</span>
            <span>Cerrar sesión</span>
          </button>
        </Form>
      </div>
    </aside>
  );
});
