/**
 * useClickOutside - Detección de Clicks Fuera de un Elemento
 * 
 * Hook que ejecuta un callback cuando el usuario hace click
 * fuera del elemento referenciado. Esencial para cerrar
 * dropdowns, modales y menús al interactuar fuera.
 * 
 * Patrón: useOnDocument para eventos globales + Signal de ref DOM.
 * Razón: useOnDocument es la forma idiomática en Qwik de escuchar
 * eventos del document (no addEventListener nativo).
 * 
 * IMPORTANTE: Solo activo cuando el elemento está visible/montado.
 * No registra el listener si ref.value es undefined.
 * 
 * @example
 * // Cerrar dropdown al click fuera
 * const dropdownRef = useSignal<Element>();
 * const isOpen = useSignal(false);
 * 
 * useClickOutside(dropdownRef, $(() => {
 *   isOpen.value = false;
 * }));
 * 
 * return (
 *   <div ref={dropdownRef}>
 *     ...contenido del dropdown
 *   </div>
 * );Li
 * 
 * @example
 * // Cerrar sidebar en mobile al click fuera
 * const sidebarRef = useSignal<Element>();
 * const sidebar = useContext(SidebarContext);
 * 
 * useClickOutside(sidebarRef, $(() => {
 *   if (window.innerWidth < 1024) {
 *     sidebar.close();
 *   }
 * }));
 */

import { useOnDocument, $, type Signal, type QRL } from '@builder.io/qwik';

/**
 * useClickOutside Hook - Export Principal
 * 
 * Registra un listener global en el document para detectar
 * clicks fuera del elemento referenciado.
 * 
 * Limpieza automática:
 * Qwik gestiona automáticamente la limpieza del listener
 * cuando el componente se desmonta (no hay que hacer removeEventListener).
 * 
 * @param ref - Signal con referencia al elemento DOM a vigilar
 * @param callback - QRL a ejecutar cuando se detecta click fuera
 */
export function useClickOutside(
  ref: Signal<Element | undefined>,
  callback: QRL<() => void>
): void {
  useOnDocument(
    'click',
    $((event: Event) => {
      // Si el ref no está montado, no hacer nada
      if (!ref.value) return;

      // Verificar si el click fue DENTRO del elemento referenciado
      const clickedInside = ref.value.contains(event.target as Node);

      // Solo ejecutar callback si el click fue FUERA
      if (!clickedInside) {
        callback();
      }
    })
  );
}