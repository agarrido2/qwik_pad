/**
 * Select Component - Dropdown Personalizado con Estilos Modernos
 *
 * Selector custom que reemplaza el <select> nativo con un dropdown estilizado.
 * Incluye soporte para íconos, descripciones y estados de error.
 *
 * Características:
 * - Variantes visuales: default, error, success (armonizado con Input)
 * - Tamaños: sm, default, lg (consistencia con Button/Input)
 * - Accesibilidad: ARIA roles, keyboard navigation (próximamente)
 *
 * @example
 * // Select con iconos y descripciones
 * <Select
 *   name="sector"
 *   options={[
 *     { value: 'tech', label: 'Tecnología', icon: '💻', description: 'Software y hardware' }
 *   ]}
 *   onChange$={handleChange}
 *   error={fieldError.value}
 * />
 */

import { component$, useSignal, $, type QRL } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Variantes del trigger button mediante CVA.
 *
 * Razón: Armonización con Input component. Un Select debe verse como un Input
 * en su estado cerrado, manteniendo consistencia visual del form.
 */
const selectTriggerVariants = cva(
  // Base: Layout y comportamiento compartido
  "relative w-full rounded-lg border-2 bg-background px-4 text-left text-foreground transition-all duration-200 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-error hover:border-error/80 focus:ring-error",
        success: "border-success hover:border-success/80 focus:ring-success",
      },
      size: {
        sm: "py-2 text-xs", // Altura ~h-8 (alineado con Input sm)
        default: "py-3 text-sm", // Altura ~h-10 (alineado con Input default)
        lg: "py-4 text-base", // Altura ~h-12 (alineado con Input lg)
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface SelectProps
  extends VariantProps<typeof selectTriggerVariants> {
  /** Nombre del campo (requerido para forms) */
  name: string;

  /** Opciones del dropdown */
  options: SelectOption[];

  /** Valor seleccionado */
  value?: string;

  /** Handler de cambio */
  onChange$: QRL<(value: string) => void>;

  /** Placeholder cuando no hay selección */
  placeholder?: string;

  /** Label del campo */
  label?: string;

  /** Campo requerido */
  required?: boolean;

  /** Mensaje de error (fuerza variant="error") */
  error?: string;

  /** Clases CSS adicionales para el wrapper */
  class?: string;
}

export const Select = component$<SelectProps>(
  ({
    name,
    options,
    value,
    onChange$,
    placeholder = "Selecciona una opción",
    label,
    required = false,
    error,
    class: className,
    variant,
    size,
  }) => {
    // Estado del dropdown (abierto/cerrado)
    const isOpen = useSignal(false);
    const selectedOption = options.find((opt) => opt.value === value);

    // Handlers de interacción con serialización ($)
    const toggleDropdown = $(() => {
      isOpen.value = !isOpen.value;
    });

    const selectOption = $((optionValue: string) => {
      onChange$(optionValue);
      isOpen.value = false;
    });

    // Forzar variant="error" si existe mensaje de error (consistencia con Input)
    const computedVariant = error ? "error" : variant;

    return (
      <div class={cn("relative", className)}>
        {/* Label con asterisco si es required */}
        {label && (
          <label class="text-foreground mb-2 block text-sm font-medium">
            {label}
            {required && (
              <span class="text-error ml-1" aria-label="obligatorio">
                *
              </span>
            )}
          </label>
        )}

        {/* Hidden input para form submission */}
        <input type="hidden" name={name} value={value || ""} />

        {/* Trigger Button con variantes CVA */}
        <button
          type="button"
          onClick$={toggleDropdown}
          class={cn(
            selectTriggerVariants({ variant: computedVariant, size }),
            !selectedOption && "text-muted-foreground", // Placeholder styling
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen.value}
        >
          <div class="flex items-center justify-between">
            {/* Contenido seleccionado o placeholder */}
            <div class="flex items-center gap-3">
              {selectedOption?.icon && (
                <span class="text-2xl" aria-hidden="true">
                  {selectedOption.icon}
                </span>
              )}
              <div>
                <div class="text-foreground font-medium">
                  {selectedOption?.label || placeholder}
                </div>
                {selectedOption?.description && (
                  <div class="text-muted-foreground text-xs">
                    {selectedOption.description}
                  </div>
                )}
              </div>
            </div>

            {/* Chevron indicador (rotación animada) */}
            <svg
              class={cn(
                "text-muted-foreground h-5 w-5 transition-transform duration-200",
                isOpen.value && "rotate-180",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu (condicional) */}
        {isOpen.value && (
          <div class="border-border bg-popover text-popover-foreground absolute z-10 mt-2 w-full rounded-lg border shadow-xl">
            <ul class="max-h-80 overflow-auto py-2" role="listbox">
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick$={() => selectOption(option.value)}
                    class={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
                      "hover:bg-accent",
                      option.value === value && "bg-primary/10",
                    )}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {/* Ícono de opción */}
                    {option.icon && (
                      <span class="text-2xl" aria-hidden="true">
                        {option.icon}
                      </span>
                    )}

                    {/* Label y descripción */}
                    <div class="flex-1">
                      <div class="text-foreground font-medium">
                        {option.label}
                      </div>
                      {option.description && (
                        <div class="text-muted-foreground text-xs">
                          {option.description}
                        </div>
                      )}
                    </div>

                    {/* Checkmark para opción seleccionada */}
                    {option.value === value && (
                      <svg
                        class="text-primary h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <p class="text-error mt-1 text-sm leading-relaxed" role="alert">
            {error}
          </p>
        )}

        {/* Overlay para cerrar dropdown al hacer click fuera */}
        {isOpen.value && (
          <div
            class="fixed inset-0 z-0"
            onClick$={toggleDropdown}
            aria-hidden="true"
          />
        )}
      </div>
    );
  },
);
