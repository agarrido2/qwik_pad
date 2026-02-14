/**
 * Dashboard Header - Barra superior del dashboard
 * 
 * Posicionamiento: fixed top-0 left-64 right-0 h-16
 * - left-64 (256px) para respetar el sidebar
 * - Elementos: Notificaciones + Dark mode toggle + Profile dropdown
 * 
 * Filosofía: Mantener simple, sin search bar ni paneles complejos
 * Dark mode: Placeholder por ahora (implementar en futuras iteraciones)
 */

import { component$, useSignal } from '@builder.io/qwik';
import { Form, Link } from '@builder.io/qwik-city';
import { cn } from '~/lib/utils/cn';
import { useLogoutAction } from '~/routes/(app)/dashboard/layout';
import { usePermissions } from '~/lib/auth/use-permissions';

interface DashboardHeaderProps {
  /** Título de la página actual (ej: "Dashboard", "Llamadas") */
  title?: string;
  /** Número de notificaciones sin leer (badge rojo) */
  notificationCount?: number;
}

export const DashboardHeader = component$<DashboardHeaderProps>(
  ({ title = 'Dashboard', notificationCount = 0 }) => {
    const profileMenuOpen = useSignal(false);
    const logoutAction = useLogoutAction();
    
    // RBAC: Permisos derivados del OrganizationContext (useComputed$, 0 server queries)
    const permissions = usePermissions();

    return (
      <header class="fixed top-0 left-64 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 z-20">
        {/* Título de la página */}
        <h1 class="text-lg font-semibold text-neutral-900">{title}</h1>

        {/* Actions: Notificaciones + Dark mode + Profile */}
        <div class="flex items-center gap-3">
          {/* Notificaciones */}
          <button
            class="relative p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            aria-label={
              notificationCount > 0
                ? `${notificationCount} notificaciones sin leer`
                : 'Sin notificaciones'
            }
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Badge de notificaciones */}
            {notificationCount > 0 && (
              <span class="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Dark mode toggle - Placeholder (implementar hook useTheme en futuro) */}
          <button
            class="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            aria-label="Cambiar tema"
            title="Cambiar tema (próximamente)"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          {/* Profile dropdown */}
          <div class="relative">
            <button
              onClick$={() => (profileMenuOpen.value = !profileMenuOpen.value)}
              class="flex items-center gap-2 p-2 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Menú de perfil"
              aria-expanded={profileMenuOpen.value}
            >
              {/* Avatar placeholder (usar imagen real del usuario en futuro) */}
              <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                U
              </div>
              
              {/* Badge de rol - Usa color y label del loader */}
              <span class={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                permissions.value.roleBadgeColor
              )}>
                {permissions.value.roleLabel}
              </span>
              
              {/* Chevron down */}
              <svg
                class={cn(
                  'h-4 w-4 text-neutral-500 transition-transform',
                  profileMenuOpen.value && 'rotate-180'
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

            {/* Dropdown menu */}
            {profileMenuOpen.value && (
              <div class="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white shadow-lg py-1 z-30">
                <Link
                  href="/dashboard/perfil"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Mi perfil
                </Link>

                <Link
                  href="/dashboard/configuracion"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Configuración
                </Link>

                <div class="border-t border-neutral-200 my-1"></div>

                <Form action={logoutAction}>
                  <button
                    type="submit"
                    class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Cerrar sesión
                  </button>
                </Form>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }
);
