/**
 * Alert Component - Notificaciones y Mensajes de Estado
 * 
 * Sistema de alertas semánticas para comunicar estados del sistema al usuario.
 * Incluye iconografía contextual automática y soporte para títulos.
 * 
 * Accesibilidad: role="alert" para anuncios a lectores de pantalla.
 * 
 * @example
 * // Error con título
 * <Alert variant="error" title="Error de Validación">
 *   El email ya está registrado.
 * </Alert>
 * 
 * @example
 * // Success inline
 * <Alert variant="success">
 *   Cambios guardados correctamente.
 * </Alert>
 */

import { component$, Slot } from '@builder.io/qwik';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils/cn';

/**
 * Variantes semánticas del Alert mediante CVA.
 * 
 * Razón de CVA: Los colores y estilos están acoplados al significado semántico.
 * CVA garantiza que variant="error" SIEMPRE tenga el mismo diseño visual.
 */
const alertVariants = cva(
  // Base: Layout compartido
  'flex gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        // Info: Información neutral (tips, hints)
        info: 'border-info/50 bg-info/10 text-info',
        
        // Success: Confirmación de acción exitosa
        success: 'border-success/50 bg-success/10 text-success',
        
        // Warning: Advertencia que requiere atención
        warning: 'border-warning/50 bg-warning/10 text-warning',
        
        // Error: Error crítico o validación fallida
        error: 'border-error/50 bg-error/10 text-error',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

export interface AlertProps extends VariantProps<typeof alertVariants> {
  /** Título opcional del alert */
  title?: string;
  
  /** Clases CSS adicionales */
  class?: string;
}

/**
 * Iconos contextuales por variante.
 * 
 * Razón de separar del componente: Mantiene el JSX limpio y permite
 * futuras extensiones (ej: iconos personalizados via prop).
 */
const alertIcons = {
  info: (
    <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
} as const;

export const Alert = component$<AlertProps>(
  ({ variant = 'info', title, class: className }) => {
    // Asegurar variant válido para index type-safety
    const safeVariant = variant || 'info';
    
    return (
      <div class={cn(alertVariants({ variant }), className)} role="alert">
        {/* Ícono contextual automático */}
        {alertIcons[safeVariant]}

        <div class="flex-1">
          {/* Título opcional */}
          {title && <h4 class="mb-1 font-semibold">{title}</h4>}
          
          {/* Contenido del mensaje */}
          <div class="text-sm">
            <Slot />
          </div>
        </div>
      </div>
    );
  }
);
