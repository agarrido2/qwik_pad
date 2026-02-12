/**
 * Button Component - Sistema de Diseño UI
 * 
 * Componente de botón basado en CVA (Class Variance Authority) que proporciona
 * variantes semánticas, tamaños consistentes y micro-interacciones refinadas.
 * 
 * Patrón: Tipado automático mediante VariantProps<> para máxima seguridad TypeScript.
 * UX: Incluye feedback táctil (scale), depth visual (shadow) y transiciones suaves.
 * 
 * @example
 * // Botón primario con loading state externo
 * <Button variant="default" size="lg">
 *   <Spinner />
 *   Guardando...
 * </Button>
 * 
 * @example
 * // Botón destructivo con ícono
 * <Button variant="destructive" size="icon" aria-label="Eliminar">
 *   <TrashIcon />
 * </Button>
 */

import { component$, Slot, type PropFunction } from '@builder.io/qwik';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils/cn';

/**
 * Definición de variantes del Button mediante CVA.
 * 
 * Base: Clases compartidas por todas las variantes (layout, accesibilidad, transiciones).
 * Variants: Configuración semántica de colores, estilos y tamaños.
 * 
 * Razón del Patrón: CVA genera tipos TypeScript automáticamente, eliminando
 * la necesidad de Record<> manuales y previniendo desincronización entre tipos y clases.
 */
const buttonVariants = cva(
  // Base: Aplicado a TODOS los botones
  'inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        // Primary: Acción principal de contexto
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-md focus:bg-primary/90 rounded-md',
        
        // Destructive: Acciones peligrosas (eliminar, cancelar operación crítica)
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md focus:bg-destructive/90 rounded-md',
        
        // Success: Confirmación positiva (aprobar, publicar, completar)
        success:
          'bg-green-500 text-white shadow hover:bg-green-600 hover:shadow-md focus:bg-green-600 rounded-md',
        
        // Outline: Acciones secundarias con jerarquía visual
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md focus:bg-accent focus:text-accent-foreground rounded-md',
        
        // Secondary: Acciones de soporte (cancelar, cerrar)
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md focus:bg-secondary/80 rounded-md',
        
        // Ghost: Acciones terciarias sin background (ej: items de menú)
        ghost:
          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md',
        
        // Link: Navegación inline (sin bordes, comportamiento textual)
        link: 'text-primary underline-offset-4 hover:underline focus:underline hover:text-primary/80 focus:text-primary/80',
      },
      size: {
        // Default: Altura estándar para formularios y toolbars
        default: 'h-10 px-4 py-2 text-sm font-medium gap-2',
        
        // SM: Espacios reducidos (tablas, chips, tags)
        sm: 'h-9 px-3 text-xs font-medium gap-2 rounded-md',
        
        // LG: Llamadas a acción (CTAs, landings)
        lg: 'h-11 px-8 text-base font-medium gap-2 rounded-md',
        
        // XL: Heros, secciones destacadas
        xl: 'h-12 px-10 text-lg font-semibold gap-2 rounded-md',
        
        // Icon: Botones cuadrados sin padding horizontal (solo íconos)
        icon: 'h-10 w-10 gap-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Props del Button con tipado automático de variantes.
 * 
 * VariantProps<> infiere automáticamente los tipos permitidos desde buttonVariants,
 * garantizando sincronización entre la definición CVA y la interfaz TypeScript.
 */
export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  /** Clases CSS adicionales (composición vía cn()) */
  class?: string;
  
  /** Estado disabled (previene interacción) */
  disabled?: boolean;
  
  /** Tipo HTML nativo del botón */
  type?: 'button' | 'submit' | 'reset';
  
  /** Handler de evento click (serializablе con $) */
  onClick$?: PropFunction<() => void>;
  
  /** Label accesible para lectores de pantalla */
  'aria-label'?: string;
}

/**
 * Button Component - Export Principal
 * 
 * Renderiza un botón HTML nativo con variantes semánticas y accesibilidad completa.
 * 
 * Separación de Responsabilidades:
 * - Este componente maneja SOLO la UI del botón.
 * - Estados de loading se gestionan externamente con <Spinner /> en Slot.
 * - Lógica de negocio vive en services, no en este componente.
 */
export const Button = component$<ButtonProps>(
  ({ variant, size, class: className, disabled, type = 'button', onClick$, 'aria-label': ariaLabel, ...props }) => {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick$={onClick$}
        class={cn(buttonVariants({ variant, size }), className)}
        aria-label={ariaLabel}
        {...props}
      >
        <Slot />
      </button>
    );
  }
);
