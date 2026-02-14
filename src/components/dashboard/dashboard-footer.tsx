/**
 * Dashboard Footer - Barra inferior del dashboard
 * 
 * Estructura: fixed bottom-0 left-0 right-0 h-12
 * - Zona izquierda (w-64): Toast messages (alineado con sidebar)
 * - Zona derecha (flex-1): Fecha + Soporte IT + Versión
 * 
 * Pattern: El toast se renderiza en la parte izquierda, alineado con el sidebar.
 * Datos informativos (fecha, soporte, versión) en la parte derecha.
 * 
 * NOTA: Por ahora el footer NO usa toast system (placeholder para futuras mejoras)
 * El toast se implementará cuando haya acciones que requieran feedback
 */

import { component$, useComputed$ } from '@builder.io/qwik';

export const DashboardFooter = component$(() => {
  /**
   * Fecha actual memoizada con useComputed$ (derivación síncrona pura)
   * Evita recalcular en cada render. Se evalúa solo en SSR.
   */
  const currentDate = useComputed$(() => {
    return new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  /** Versión dinámica desde env o fallback estático */
  const appVersion = import.meta.env.PUBLIC_APP_VERSION || '1.0.0';

  return (
    <footer class="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-neutral-200 flex items-center z-10">
      {/* ZONA IZQUIERDA: Toast messages (placeholder) */}
      <div class="w-64 px-4 border-r border-neutral-200 flex items-center">
        <span class="text-xs text-neutral-400">Sistema listo</span>
      </div>

      {/* ZONA DERECHA: Datos informativos */}
      <div class="flex-1 px-6 flex items-center justify-between text-sm text-neutral-600">
        {/* Fecha actual */}
        <span class="text-xs">{currentDate.value}</span>

        {/* Soporte IT */}
        <span class="text-xs">
          Soporte IT:{' '}
          <a
            href="tel:+34123456789"
            class="text-primary-600 hover:text-primary-700 font-medium"
          >
            +34 123 456 789
          </a>
        </span>

        {/* Versión de la app */}
        <span class="text-xs text-neutral-400">v{appVersion}</span>
      </div>
    </footer>
  );
});
