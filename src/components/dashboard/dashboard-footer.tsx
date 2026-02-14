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

import { component$ } from '@builder.io/qwik';

export const DashboardFooter = component$(() => {
  /**
   * Helper: Formatea la fecha actual en español
   */
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Helper: Obtiene la versión desde package.json
   * (En futuro, importar dinámicamente o pasar como prop)
   */
  const appVersion = 'v1.0.0'; // TODO: Importar desde package.json

  return (
    <footer class="fixed bottom-0 left-0 right-0 h-12 bg-white border-t border-neutral-200 flex items-center z-10">
      {/* ZONA IZQUIERDA: Toast messages (placeholder) */}
      <div class="w-64 px-4 border-r border-neutral-200 flex items-center">
        <span class="text-xs text-neutral-400">Sistema listo</span>
      </div>

      {/* ZONA DERECHA: Datos informativos */}
      <div class="flex-1 px-6 flex items-center justify-between text-sm text-neutral-600">
        {/* Fecha actual */}
        <span class="text-xs">{getCurrentDate()}</span>

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
        <span class="text-xs text-neutral-400">{appVersion}</span>
      </div>
    </footer>
  );
});
