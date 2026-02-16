/**
 * Dropdown UI Component - Menú contextual reutilizable
 *
 * Componente compuesto para menús desplegables del sistema UI.
 * Implementa patrón de overlay click-outside para cierre sin useVisibleTask$,
 * preservando resumabilidad y evitando listeners globales en document.
 */

import {
  component$,
  createContextId,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
  type PropFunction,
  type Signal,
} from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { cn } from '~/lib/utils/cn';

interface DropdownProps {
  /** Alineación horizontal del panel respecto al trigger */
  align?: 'left' | 'right';
  /** Clase de ancho del panel (ej: w-48, w-56) */
  width?: string;
}

interface DropdownItemProps {
  /** Navegación interna Qwik City (renderiza Link) */
  href?: string;
  /** Handler para acciones locales (renderiza button) */
  onClick$?: PropFunction<() => void>;
  /** Variante visual semántica */
  variant?: 'default' | 'danger';
  /** Clases adicionales para customización puntual */
  class?: string;
}

const DropdownOpenContext = createContextId<Signal<boolean>>('ui.dropdown.open');

/**
 * Contenedor principal de dropdown con trigger por named slot.
 *
 * API de composición:
 * - Slot `trigger`: elemento interactivo que abre/cierra el menú
 * - Slot default: contenido del panel (items, separadores, formularios)
 */
export const Dropdown = component$<DropdownProps>(({ align = 'right', width = 'w-48' }) => {
  const isOpen = useSignal(false);
  useContextProvider(DropdownOpenContext, isOpen);

  return (
    <div class="relative">
      <div
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
        aria-expanded={isOpen.value}
      >
        <Slot name="trigger" />
      </div>

      {isOpen.value && (
        <>
          <button
            type="button"
            class="fixed inset-0 z-30"
            aria-label="Cerrar menú"
            onClick$={() => {
              isOpen.value = false;
            }}
          />

          <div
            class={cn(
              'absolute mt-2 rounded-md border border-neutral-200 bg-white shadow-lg py-1 z-40',
              align === 'right' ? 'right-0' : 'left-0',
              width,
            )}
            role="menu"
          >
            <Slot />
          </div>
        </>
      )}
    </div>
  );
});

/**
 * Item de dropdown reutilizable para navegación o acción local.
 */
export const DropdownItem = component$<DropdownItemProps>(
  ({ href, onClick$, variant = 'default', class: className }) => {
    const isOpen = useContext(DropdownOpenContext);

    const itemClasses = cn(
      'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
      variant === 'danger'
        ? 'text-red-600 hover:bg-red-50'
        : 'text-neutral-700 hover:bg-neutral-100',
      className,
    );

    if (href) {
      return (
        <Link
          href={href}
          class={itemClasses}
          role="menuitem"
          onClick$={() => {
            isOpen.value = false;
          }}
        >
          <Slot />
        </Link>
      );
    }

    return (
      <button
        type="button"
        class={itemClasses}
        role="menuitem"
        onClick$={() => {
          isOpen.value = false;
          onClick$?.();
        }}
      >
        <Slot />
      </button>
    );
  },
);

/**
 * Separador visual entre grupos de acciones del menú.
 */
export const DropdownSeparator = component$(() => {
  return <div class="border-t border-neutral-200 my-1" role="separator" />;
});
