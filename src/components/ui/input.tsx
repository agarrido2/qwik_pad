/**
 * Input Component - Campo de Entrada de Formulario
 *
 * Componente completo de input que incluye label, validación visual, helper text
 * y mensajes de error. Diseñado para máxima accesibilidad (WCAG 2.1 AA).
 *
 * Características:
 * - Asociación automática label-input mediante IDs únicos
 * - Estados visuales: default, error, success (CVA)
 * - Tamaños: sm, default, lg (consistencia con Button)
 * - Compatibilidad total con FormField de Qwik City
 *
 * @example
 * // Input básico con validación
 * <Input
 *   name="email"
 *   type="email"
 *   label="Email"
 *   error={emailError.value}
 *   required
 * />
 *
 * @example
 * // Input con helper text
 * <Input
 *   name="username"
 *   label="Usuario"
 *   helperText="Solo letras y números"
 *   variant="success"
 * />
 */

import { component$, type QRL } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils/cn";

/**
 * Variantes del Input mediante CVA.
 *
 * Razón: Separamos estados visuales (default, error, success) de estados HTML (disabled).
 * Esto permite composición clara y extensión futura (ej: variant="warning").
 */
const inputVariants = cva(
  // Base: Estilos compartidos (layout, transiciones, focus)
  "w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default: Sin validación activa
        default:
          "border-input hover:border-border focus-visible:ring-ring focus-visible:border-primary",

        // Error: Validación fallida (muestra mensaje de error)
        error:
          "border-error hover:border-error/80 focus-visible:ring-error focus-visible:border-error",

        // Success: Validación exitosa (confirmación visual)
        success:
          "border-success hover:border-success/80 focus-visible:ring-success focus-visible:border-success",
      },
      size: {
        sm: "h-8 text-xs", // Formularios compactos, filtros
        default: "h-10 text-sm", // Altura estándar (alineada con Button default)
        lg: "h-12 text-base", // Formularios destacados, CTAs
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Props del Input con tipado CVA + props HTML nativas.
 */
export interface InputProps extends VariantProps<typeof inputVariants> {
  /** Nombre del campo (requerido para formularios) */
  name: string;

  /** Tipo HTML del input */
  type?: "text" | "email" | "password" | "number" | "tel" | "url";

  /** Valor controlado (opcional) */
  value?: string;

  /** Texto de placeholder */
  placeholder?: string;

  /** Estado disabled */
  disabled?: boolean;

  /** Mensaje de error (activa variant="error" automáticamente) */
  error?: string;

  /** Label del campo */
  label?: string;

  /** Campo requerido (muestra asterisco) */
  required?: boolean;

  /** Texto de ayuda (mostrado cuando no hay error) */
  helperText?: string;

  /** Handler de evento input */
  onInput$?: QRL<(event: Event) => void>;

  /** Clases CSS adicionales para el wrapper */
  class?: string;

  /** Autocomplete hint para navegadores */
  autocomplete?: HTMLInputElement["autocomplete"];

  /** ARIA describedby personalizado */
  "aria-describedby"?: string;

  /** Clases CSS adicionales especificas para el elemento input */
  inputClass?: string;
}

/**
 * Input Component - Export Principal
 *
 * Nota sobre Variantes:
 * - Si se pasa `error`, el variant se fuerza a "error" automáticamente.
 * - Esto garantiza consistencia visual sin lógica duplicada.
 */
export const Input = component$<InputProps>(
  ({
    name,
    type = "text",
    value,
    placeholder,
    disabled = false,
    error,
    label,
    required = false,
    helperText,
    onInput$,
    autocomplete,
    class: className,
    inputClass,
    "aria-describedby": ariaDescribedby,
    variant,
    size,
  }) => {
    // IDs únicos para accesibilidad (asociar label, error, helper)
    const inputId = `input-${name}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Forzar variant="error" si existe mensaje de error (prioridad lógica)
    const computedVariant = error ? "error" : variant;

    return (
      <div class={cn("flex flex-col gap-1", className)}>
        {/* Label con asterisco si es required */}
        {label && (
          <label for={inputId} class="text-foreground text-sm font-medium">
            {label}
            {required && (
              <span class="text-error ml-1" aria-label="obligatorio">
                *
              </span>
            )}
          </label>
        )}

        {/* Input con variantes CVA */}
        <input
          id={inputId}
          name={name}
          type={type}
          {...(value !== undefined && { value })}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autocomplete={autocomplete}
          onInput$={onInput$}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : ariaDescribedby
          }
          class={cn(
            inputVariants({ variant: computedVariant, size }),
            inputClass,
          )}
        />

        {/* Helper text (solo si no hay error) */}
        {helperText && !error && (
          <p id={helperId} class="text-muted-foreground text-xs">
            {helperText}
          </p>
        )}

        {/* Mensaje de error (role="alert" para lectores de pantalla) */}
        {error && (
          <p
            id={errorId}
            class="text-error text-sm leading-relaxed"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
