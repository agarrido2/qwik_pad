/**
 * Card Component - Contenedor de Contenido
 * 
 * Sistema de tarjetas con variantes visuales y padding configurable.
 * Diseñado para dashboards, grids de contenido y layouts modulares.
 * 
 * Características:
 * - Variantes: default, outlined, elevated, interactive
 * - Padding: none, sm, md, lg (control granular de espaciado)
 * - Soporte para hover effects (interactive)
 * 
 * @example
 * // Card interactiva (clickeable)
 * <Card variant="interactive" padding="lg">
 *   <CardHeader>
 *     <CardTitle>Dashboard</CardTitle>
 *   </CardHeader>
 *   <CardContent>...</CardContent>
 * </Card>
 */

import { component$, Slot } from '@builder.io/qwik';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils/cn';

/**
 * Variantes del Card mediante CVA.
 * 
 * Razón de separar variant y padding: Permite composición independiente
 * (ej: elevated + padding sm, o interactive + padding none para custom content).
 */
const cardVariants = cva(
  // Base: Layout y estructura común
  'rounded-lg bg-white',
  {
    variants: {
      variant: {
        // Default: Card estándar con borde y sombra sutil
        default: 'border border-neutral-200 shadow-sm',
        
        // Outlined: Solo borde, sin sombra (layouts minimalistas)
        outlined: 'border-2 border-neutral-300',
        
        // Elevated: Sombra pronunciada (elementos destacados)
        elevated: 'shadow-lg border border-neutral-100',
        
        // Interactive: Hover con feedback visual (clickeable)
        interactive:
          'border border-neutral-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary-300 cursor-pointer active:scale-[0.99]',
      },
      padding: {
        none: 'p-0',  // Para contenido custom (imágenes full-width)
        sm: 'p-4',    // Tarjetas compactas
        md: 'p-6',    // Default: equilibrio espacio/contenido
        lg: 'p-8',    // Sections destacadas
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps extends VariantProps<typeof cardVariants> {
  /** Clases CSS adicionales */
  class?: string;
}

export const Card = component$<CardProps>(
  ({ class: className, variant, padding }) => {
    return (
      <div class={cn(cardVariants({ variant, padding }), className)}>
        <Slot />
      </div>
    );
  }
);

export const CardHeader = component$<{ class?: string }>(({ class: className }) => {
  return (
    <div class={cn('mb-4 space-y-1', className)}>
      <Slot />
    </div>
  );
});

export const CardTitle = component$<{ class?: string }>(({ class: className }) => {
  return (
    <h3 class={cn('text-xl font-semibold text-neutral-900', className)}>
      <Slot />
    </h3>
  );
});

export const CardDescription = component$<{ class?: string }>(({ class: className }) => {
  return (
    <p class={cn('text-sm text-neutral-600', className)}>
      <Slot />
    </p>
  );
});

export const CardContent = component$<{ class?: string }>(({ class: className }) => {
  return (
    <div class={cn('', className)}>
      <Slot />
    </div>
  );
});

export const CardFooter = component$<{ class?: string }>(({ class: className }) => {
  return (
    <div class={cn('mt-4 flex items-center gap-2', className)}>
      <Slot />
    </div>
  );
});
