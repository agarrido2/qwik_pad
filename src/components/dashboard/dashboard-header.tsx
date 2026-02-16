/**
 * Dashboard Header - Barra superior del dashboard
 * 
 * Posicionamiento: fixed top-0 left-72 right-0 h-16
 * - left-72 (288px) para respetar el sidebar
 * - Elementos: Notificaciones + Dark mode toggle + Profile dropdown
 * 
 * Filosofía: Mantener simple, sin search bar ni paneles complejos
 * Dark mode: Placeholder por ahora (implementar en futuras iteraciones)
 * 
 * Refactorizado: 2026-02-15 - Descomponetizado en sub-componentes
 */

import { component$ } from '@builder.io/qwik';
import { NotificationUser, ThemeToggle, ProfileUser } from './header';

interface DashboardHeaderProps {
  /** Título de la página actual (ej: "Dashboard", "Llamadas") */
  title?: string;
  /** Número de notificaciones sin leer (badge rojo) */
  notificationCount?: number;
}

export const DashboardHeader = component$<DashboardHeaderProps>(
  ({ title = 'Dashboard', notificationCount = 0 }) => {
    return (
      <header class="fixed top-0 left-72 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 z-20">
        {/* Título de la página */}
        <h1 class="text-lg font-semibold text-neutral-900">{title}</h1>

        {/* Actions: Notificaciones + Dark mode + Profile */}
        <div class="flex items-center gap-3">
          <NotificationUser count={notificationCount} />
          <ThemeToggle />
          <ProfileUser />
        </div>
      </header>
    );
  }
);
