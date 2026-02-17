/**
 * Dashboard Header - Barra superior del dashboard
 * 
 * Posicionamiento: fixed top-0 left-72 right-0 h-16
 * - left-72 (288px) alineado con sidebar w-72
 * - Elementos: Título + Notificaciones + Dark mode toggle + Profile dropdown
 * 
 * Colores 2026-02-17:
 * - Migrado a sistema HSL (bg-card, border-border, text-foreground)
 * - Dark mode automático sin cambios adicionales
 */

import { component$, useContext } from '@builder.io/qwik';
import { SidebarContext } from '~/lib/context/sidebar.context';
import { NotificationUser, ThemeToggle, ProfileUser } from './header';
import { cn } from '~/lib/utils/cn';

interface DashboardHeaderProps {
  title?: string;
  notificationCount?: number;
  class?: string;
}

export const DashboardHeader = component$<DashboardHeaderProps>(
  ({ title = 'Dashboard', notificationCount = 0, class: className }) => {
    const sidebar = useContext(SidebarContext);

    return (
  <header class={cn(
    'fixed top-0 right-0 h-16 bg-card border-b border-border',
    'flex items-center justify-between px-6 z-20',
    className
  )}>
    {/* Izquierda: SOLO título (sin wrapper div) */}
    <h1 class="text-lg font-semibold text-foreground">{title}</h1>

    {/* Derecha: Actions + Hamburguesa AL FINAL */}
    <div class="flex items-center gap-3">
      <NotificationUser count={notificationCount} />
      <ThemeToggle />
      <ProfileUser />

      {/* Hamburguesa - movida aquí, último elemento */}
      <button
        onClick$={sidebar.toggleOpen}
        class="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Abrir menú"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </header>
);
  }
);