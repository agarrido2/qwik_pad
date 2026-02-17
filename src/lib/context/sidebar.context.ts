/**
 * Sidebar Context - Estado Global del Layout del Dashboard
 *
 * Gestiona DOS estados independientes:
 * - isOpen: Sidebar visible/oculto (mobile overlay)
 * - isCollapsed: Sidebar expandido/colapsado a iconos (desktop)
 *
 * Persistencia localStorage:
 * - 'sidebarleft' → estado collapsed del desktop (el que el usuario recuerda)
 * - El estado mobile (isOpen) NO se persiste (siempre empieza cerrado en mobile)
 *
 * Patrón: createContextId + useContextProvider en layout + useContext en hijos.
 *
 * @example
 * // routes/(app)/dashboard/layout.tsx - Provider
 * import { provideSidebarContext } from '~/lib/context/sidebar.context';
 *
 * @example
 * // Cualquier hijo - Consumer
 * const sidebar = useContext(SidebarContext);
 * sidebar.toggleCollapse(); // Desktop
 * sidebar.toggleOpen();     // Mobile
 */

import {
  createContextId,
  useContextProvider,
  useSignal,
  useTask$,
  $,
  type Signal,
  type QRL,
} from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';

const STORAGE_KEY = 'sidebarleft' as const;
const MOBILE_BREAKPOINT = 1024 as const;

// ============================================================================
// INTERFAZ
// ============================================================================

export interface SidebarContextState {
  /** Mobile: sidebar visible (overlay) o oculto */
  isOpen: Signal<boolean>;

  /** Desktop: sidebar expandido (w-72) o colapsado (w-16, solo iconos) */
  isCollapsed: Signal<boolean>;

  /** Mobile: toggle open/close */
  toggleOpen: QRL<() => void>;

  /** Desktop: toggle expanded/collapsed (persiste en localStorage) */
  toggleCollapse: QRL<() => void>;

  /** Cerrar sidebar mobile explícitamente (ej: al navegar) */
  closeMobile: QRL<() => void>;
}

// ============================================================================
// CONTEXT ID
// ============================================================================

export const SidebarContext = createContextId<SidebarContextState>(
  'onucall.sidebar-context'
);

// ============================================================================
// PROVIDER
// ============================================================================

export function provideSidebarContext(): SidebarContextState {
  // Mobile: empieza cerrado siempre
  const isOpen = useSignal<boolean>(false);

  // Desktop: empieza expandido, se corrige con localStorage en cliente
  const isCollapsed = useSignal<boolean>(false);

  // ─── Leer localStorage al montar (solo cliente) ───────────────────────────
  useTask$(() => {
    if (isServer) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Solo aplica en desktop (>= 1024px)
      if (stored !== null && window.innerWidth >= MOBILE_BREAKPOINT) {
        isCollapsed.value = stored === 'true';
      }
    } catch {
      // localStorage no disponible, mantener default
    }
  });

  // ─── Persistir isCollapsed en localStorage cuando cambia ─────────────────
  useTask$(({ track }) => {
    track(() => isCollapsed.value);
    if (isServer) return;

    try {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed.value));
    } catch {
      // Silenciar errores de escritura
    }
  });

  // ─── Acciones ─────────────────────────────────────────────────────────────

  /** Mobile: abrir/cerrar overlay */
  const toggleOpen = $(() => {
    isOpen.value = !isOpen.value;
  });

  /** Desktop: expandir/colapsar a iconos */
  const toggleCollapse = $(() => {
    isCollapsed.value = !isCollapsed.value;
  });

  /** Cerrar sidebar mobile (al hacer click en link o backdrop) */
  const closeMobile = $(() => {
    isOpen.value = false;
  });

  // ─── Proveer contexto ─────────────────────────────────────────────────────
  const state: SidebarContextState = {
    isOpen,
    isCollapsed,
    toggleOpen,
    toggleCollapse,
    closeMobile,
  };

  useContextProvider(SidebarContext, state);
  return state;
}