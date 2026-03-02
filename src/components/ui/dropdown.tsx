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
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { cn } from "~/lib/utils/cn";

type DropdownMode = "menu" | "listbox";

interface DropdownProps {
  /** Alineación horizontal del panel respecto al trigger */
  align?: "left" | "right";
  /** Clase de ancho del panel (ej: w-48, w-56) */
  width?: string;
  /** Modo semántico del panel (menu o listbox) */
  mode?: DropdownMode;
  /** Label accesible del panel */
  panelAriaLabel?: string;
  /** Clases adicionales del panel */
  panelClass?: string;
  /** Clases adicionales del wrapper del trigger */
  triggerClass?: string;
  /** Signal externa opcional para controlar/leer estado abierto */
  openSignal?: Signal<boolean>;
}

interface DropdownItemProps {
  /** Navegación interna Qwik City (renderiza Link) */
  href?: string;
  /** Handler para acciones locales (renderiza button) */
  onClick$?: PropFunction<() => void>;
  /** Variante visual semántica */
  variant?: "default" | "danger";
  /** Clases adicionales para customización puntual */
  class?: string;
  /** Deshabilita interacción del item */
  disabled?: boolean;
  /** Marca item seleccionado (útil en listbox) */
  selected?: boolean;
}

interface DropdownContextValue {
  isOpen: Signal<boolean>;
  mode: DropdownMode;
}

const DropdownOpenContext =
  createContextId<DropdownContextValue>("ui.dropdown.open");

/**
 * Contenedor principal de dropdown con trigger por named slot.
 *
 * API de composición:
 * - Slot `trigger`: elemento interactivo que abre/cierra el menú
 * - Slot default: contenido del panel (items, separadores, formularios)
 */
export const Dropdown = component$<DropdownProps>(
  ({
    align = "right",
    width = "w-48",
    mode = "menu",
    panelAriaLabel,
    panelClass,
    triggerClass,
    openSignal,
  }) => {
    const internalOpenSignal = useSignal(false);
    const isOpen = openSignal ?? internalOpenSignal;

    useContextProvider(DropdownOpenContext, { isOpen, mode });

    return (
      <div class="relative">
        <div
          class={triggerClass}
          onClick$={() => {
            isOpen.value = !isOpen.value;
          }}
          aria-haspopup={mode}
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
                "border-border bg-popover text-popover-foreground absolute z-40 mt-2 rounded-md border py-1 shadow-lg",
                align === "right" ? "right-0" : "left-0",
                width,
                panelClass,
              )}
              role={mode}
              aria-label={panelAriaLabel}
            >
              <Slot />
            </div>
          </>
        )}
      </div>
    );
  },
);

/**
 * Item de dropdown reutilizable para navegación o acción local.
 */
export const DropdownItem = component$<DropdownItemProps>(
  ({
    href,
    onClick$,
    variant = "default",
    class: className,
    disabled = false,
    selected,
  }) => {
    const dropdown = useContext(DropdownOpenContext);
    const itemRole = dropdown.mode === "listbox" ? "option" : "menuitem";

    const itemClasses = cn(
      "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors",
      variant === "danger"
        ? "text-error hover:bg-error/10"
        : "text-foreground hover:bg-accent",
      disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
      selected && dropdown.mode === "listbox" && "bg-primary/10 text-primary",
      className,
    );

    if (href) {
      return (
        <Link
          href={href}
          class={itemClasses}
          role={itemRole}
          onClick$={() => {
            dropdown.isOpen.value = false;
          }}
        >
          <Slot />
        </Link>
      );
    }

    return (
      <button
        type="button"
        disabled={disabled}
        class={itemClasses}
        role={itemRole}
        aria-selected={dropdown.mode === "listbox" ? !!selected : undefined}
        onClick$={() => {
          if (disabled) return;
          dropdown.isOpen.value = false;
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
  return <div class="border-border my-1 border-t" role="separator" />;
});
