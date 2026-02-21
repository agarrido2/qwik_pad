/**
 * Dashboard Footer - Barra inferior del dashboard
 *
 * Estructura: fixed bottom-0 left-0 right-0 h-12
 * - Zona izquierda: ancho dinámico según sidebar (w-72 / w-16)
 * - Zona derecha (flex-1): Fecha + Soporte IT + Versión
 *
 * Fix 2026-02-17:
 * - Zona izquierda responde al collapse del sidebar via SidebarContext
 */

import { component$, useComputed$ } from '@builder.io/qwik';

export const DashboardFooter = component$(() => {
  const currentDate = useComputed$(() => {
    return new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  const appVersion = import.meta.env.PUBLIC_APP_VERSION || '1.0.0';

  return (
    <footer class="dashboard-footer fixed bottom-0 left-0 right-0 z-10 flex h-12 items-center px-4 sm:px-6">
      <div class="flex w-full items-center justify-between">
        <span class="text-xs text-muted-foreground">
          {currentDate.value}
        </span>

        <span class="text-xs text-muted-foreground/60">
          v{appVersion}
        </span>
      </div>
    </footer>
  );
});