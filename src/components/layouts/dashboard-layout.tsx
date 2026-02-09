import { component$, Slot, useSignal } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

/**
 * DashboardLayout - Para la aplicación interna (dashboard, settings, etc.)
 * Sidebar + contenido principal con navegación completa
 */
export const DashboardLayout = component$(() => {
  const sidebarOpen = useSignal(true);

  return (
    <div class="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <aside
        class={cn(
          'flex flex-col border-r border-neutral-200 bg-white transition-all duration-300',
          sidebarOpen.value ? 'w-64' : 'w-20'
        )}
        aria-label="Navegación del dashboard"
      >
        {/* Logo y toggle */}
        <div class="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          {sidebarOpen.value && (
            <span class="text-xl font-bold text-primary-600">Onucall</span>
          )}
          <button
            onClick$={() => (sidebarOpen.value = !sidebarOpen.value)}
            class="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            aria-label={sidebarOpen.value ? 'Contraer menú' : 'Expandir menú'}
            aria-expanded={sidebarOpen.value}
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav class="flex flex-1 flex-col gap-1 p-4" role="navigation">
          <a
            href="/dashboard"
            class={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {sidebarOpen.value && <span>Inicio</span>}
          </a>

          <a
            href="/dashboard/calls"
            class={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {sidebarOpen.value && <span>Llamadas</span>}
          </a>

          <a
            href="/dashboard/agents"
            class={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {sidebarOpen.value && <span>Agentes</span>}
          </a>

          <a
            href="/dashboard/settings"
            class={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {sidebarOpen.value && <span>Configuración</span>}
          </a>
        </nav>

        {/* User menu */}
        <div class="border-t border-neutral-200 p-4">
          <button
            class={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-neutral-700 hover:bg-neutral-100'
            )}
            aria-label="Menú de usuario"
          >
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              U
            </div>
            {sidebarOpen.value && (
              <div class="flex flex-col items-start text-left">
                <span class="text-sm font-medium">Usuario</span>
                <span class="text-xs text-neutral-500">Ver perfil</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div class="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header class="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <h1 class="text-lg font-semibold text-neutral-900">Dashboard</h1>
          
          <div class="flex items-center gap-4">
            <button
              class="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              aria-label="Notificaciones"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content area */}
        <main class="flex-1 overflow-auto p-6">
          <Slot />
        </main>
      </div>
    </div>
  );
});
