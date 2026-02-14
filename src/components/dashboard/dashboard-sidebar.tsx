/**
 * Dashboard Sidebar - Navegación principal del dashboard
 * 
 * Estructura vertical fija (left-0, top-0, h-screen) con 4 secciones:
 * 1. Logo/Org name (h-16)
 * 2. User + Workspace info (py-4)
 * 3. Menu items con active state detection (flex-1)
 * 4. Footer con Configuración/Facturación + Logout (py-4)
 * 
 * OPTIMIZACIÓN 2026-02-14:
 * - Migrado de useUserRoleLoader → usePermissions (useComputed$)
 * - Permisos derivados del OrganizationContext, 0 server queries
 * 
 * Mobile: Implementar collapse/hamburger < 768px en futuras iteraciones
 */

import { component$, useContext } from '@builder.io/qwik';
import { Form, Link, useLocation } from '@builder.io/qwik-city';
import { cn } from '~/lib/utils/cn';
import { OrganizationContext } from '~/lib/context/organization.context';
import { dashboardMenu, workspaceMenu } from '~/lib/config/menu-options';
import { useLogoutAction } from '~/routes/(app)/dashboard/layout';
import { usePermissions } from '~/lib/auth/use-permissions';
import { IconMap } from '~/components/icons/dashboard-icons';

export const DashboardSidebar = component$(() => {
  const location = useLocation();
  const orgContext = useContext(OrganizationContext);
  const logoutAction = useLogoutAction();
  const permissions = usePermissions(); // ★ useComputed$ derivado del context (0 server queries)

  /**
   * Helper: Detecta si la ruta actual matchea el href del menu item
   * Usa pathname exacto para evitar falsos positivos
   */
  const isActive = (href: string) => {
    // Match exacto para /dashboard (root)
    if (href === '/dashboard') {
      return location.url.pathname === '/dashboard' || location.url.pathname === '/dashboard/';
    }
    // Para otras rutas, detectar si empieza con el href
    return location.url.pathname.startsWith(href);
  };

  /**
   * Helper: Renderiza el icono desde el map
   * Fallback a un icono genérico si no existe
   */
  const renderIcon = (iconName: string) => {
    return IconMap[iconName] ?? IconMap.home;
  };

  /**
   * Helper: Genera iniciales del nombre para el avatar
   * Ej: "Juan Pérez" → "JP"
   */
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      class="fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 flex flex-col z-30"
      aria-label="Navegación del dashboard"
    >
      {/* 1. SECCIÓN LOGO/ORG NAME */}
      <div class="h-16 px-6 flex items-center border-b border-neutral-200">
        <h2 class="text-xl font-family-roboto font-bold text-primary-600 truncate">
          {orgContext.active.name}
        </h2>
      </div>

      {/* 2. SECCIÓN WORKSPACE INFO */}
      <div class="py-4 px-4 border-b border-neutral-200">
        <div class="flex items-center gap-3">
          {/* Avatar con iniciales (placeholder - en futuro usar imagen real) */}
          <div class="shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
            {getInitials(orgContext.active.name)}
          </div>

          {/* User + Org info */}
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-neutral-900 truncate">
              {orgContext.active.name}
            </p>
            <div class="flex items-center gap-2">
              {/* Badge de rol del usuario con color dinámico */}
              <span class={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                permissions.value.roleBadgeColor
              )}>
                {permissions.value.roleLabel}
              </span>
              
              {/* Badge del tier (Free/Pro/Enterprise) */}
              {orgContext.isPreviewMode && (
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  Demo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN MENU PRINCIPAL - flex-1 para ocupar espacio disponible */}
      <nav class="flex-1 overflow-y-auto py-4 px-3" role="navigation">
        <div class="space-y-1">
          {dashboardMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              class={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span class="shrink-0">{renderIcon(item.icon)}</span>
              <span class="flex-1">{item.label}</span>
              {/* Badge opcional (ej: notificaciones) */}
              {item.badge !== undefined && item.badge > 0 && (
                <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* 4. SECCIÓN FOOTER - Workspace menu + Logout */}
      <div class="py-4 px-3 border-t border-neutral-200 space-y-1">
        {/* Workspace menu items (Usuarios, Configuración, Facturación) */}
        {workspaceMenu.map((item) => {
          // RBAC: Ocultar "Facturación" si no es owner
          const isBillingRoute = item.href.includes('facturacion');
          if (isBillingRoute && !permissions.value.permissions.canAccessBilling) {
            return null; // Ocultar link completamente
          }
          
          // RBAC: Ocultar "Usuarios" si es member
          const isUsersRoute = item.href.includes('usuarios');
          if (isUsersRoute && !permissions.value.permissions.canWrite) {
            return null; // Solo admin/owner pueden gestionar usuarios
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              class={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span class="shrink-0">{renderIcon(item.icon)}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Botón Soporte (placeholder - abrir modal o link a docs) */}
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
