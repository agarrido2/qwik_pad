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

/**
 * Mapeo de iconos string → SVG components
 * Pattern: Los iconos se definen por nombre en menu-options.ts
 * y se renderizan aquí para evitar serializar QRL components en config
 */
const IconMap: Record<string, any> = {
  home: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  phone: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  bot: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  hash: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  ),
  puzzle: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  book: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  settings: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'credit-card': (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  logout: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  support: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  users: (
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

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
