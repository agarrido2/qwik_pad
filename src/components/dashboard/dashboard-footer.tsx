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

import { component$, useContext, useComputed$ } from '@builder.io/qwik';
import { SidebarContext } from '~/lib/context/sidebar.context';
import { cn } from '~/lib/utils/cn';

export const DashboardFooter = component$(() => {
  const sidebar = useContext(SidebarContext);

  const currentDate = useComputed$(() => {
    return new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  const appVersion = import.meta.env.PUBLIC_APP_VERSION || '1.0.0';

  return (
    <footer class="dashboard-footer fixed bottom-0 left-0 right-0 h-12 flex items-center z-10">
      {/* ZONA IZQUIERDA: alineada con sidebar (ancho dinámico) */}
      <div class={cn(
        'px-4 border-r border-border flex items-center shrink-0',
        'transition-all duration-300',
        // ✅ Fix #4: responde al collapse del sidebar
        sidebar.isCollapsed.value ? 'w-16' : 'w-72'
      )}>
        {/* Solo mostrar texto cuando sidebar expandido */}
        {!sidebar.isCollapsed.value && (
          <span class="text-xs text-muted-foreground">Sistema listo</span>
        )}
      </div>

      {/* ZONA DERECHA: Datos informativos */}
      <div class="flex-1 px-6 flex items-center justify-between">
        <span class="text-xs text-muted-foreground">
          {currentDate.value}
        </span>

        <span class="text-xs text-muted-foreground">
          Soporte IT:{' '}
          <a
            href="tel:+34123456789"
            class="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            +34 123 456 789
          </a>
        </span>

        <span class="text-xs text-muted-foreground/60">
          v{appVersion}
        </span>
      </div>
    </footer>
  );
});