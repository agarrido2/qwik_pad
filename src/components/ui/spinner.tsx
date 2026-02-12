/**
 * Spinner Component - Indicador de Carga
 * 
 * Indicador visual animado para estados de loading. Diseñado para ser componible
 * con Button, Cards y otros componentes que requieran feedback de carga.
 * 
 * Accesibilidad: Incluye role="status" y aria-label para lectores de pantalla.
 * Performance: Animación CSS pura (sin JavaScript), compatible con resumability.
 * 
 * @example
 * // En Button con loading state
 * <Button disabled={isLoading.value}>
 *   {isLoading.value && <Spinner size="sm" />}
 *   Guardar
 * </Button>
 * 
 * @example
 * // Standalone para overlays
 * <div class="flex items-center justify-center h-screen">
 *   <Spinner size="lg" />
 * </div>
 */

import { component$ } from '@builder.io/qwik';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils/cn';

/**
 * Variantes de tamaño del Spinner.
 * 
 * Razón de CVA: Mantiene consistencia con el resto del sistema de diseño
 * y permite extensión futura (ej: colores, estilos de animación).
 */
const spinnerVariants = cva(
  'animate-spin', // Base: Animación de rotación continua
  {
    variants: {
      size: {
        sm: 'h-4 w-4',   // Para buttons pequeños y badges
        md: 'h-6 w-6',   // Default: buttons normales
        lg: 'h-8 w-8',   // Overlays y pantallas de carga
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Props del Spinner con variantes CVA.
 */
export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  /** Clases CSS adicionales */
  class?: string;
  
  /** Label accesible para lectores de pantalla */
  'aria-label'?: string;
}

/**
 * Spinner Component - Export Principal
 * 
 * Renderiza un SVG animado con círculo de progreso indeterminado.
 * Compatible con `currentColor` para heredar color de texto del padre.
 */
export const Spinner = component$<SpinnerProps>(
  ({ size, class: className, 'aria-label': ariaLabel = 'Cargando' }) => {
    return (
      <div role="status" aria-label={ariaLabel}>
        <svg
          class={cn(spinnerVariants({ size }), className)}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          {/* Círculo de fondo (25% opacidad) */}
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>

          {/* Segmento animado (75% opacidad) */}
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="sr-only">{ariaLabel}</span>
      </div>
    );
  }
);
