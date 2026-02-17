/**
 * Breadcrumb Component - Sistema de Navegación Jerárquica
 * 
 * Componente de rastro de migas que proporciona contexto de ubicación
 * dentro de la jerarquía de navegación del dashboard.
 * 
 * Patrón: Tipado automático mediante VariantProps<> para variantes visuales.
 * UX: Separadores consistentes, estados hover, último item sin link (no interactivo).
 * A11y: Navegación semántica con <nav> + aria-label + aria-current.
 * 
 * Razón del Diseño:
 * - CVA genera tipos TypeScript automáticamente desde las variantes
 * - Links intermedios son navegables, último item es texto plano
 * - Separadores visuales (/) entre items con aria-hidden
 * - Focus visible con ring para navegación por teclado
 * 
 * @example
 * // Breadcrumb básico con 3 niveles
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', url: '/' },
 *     { label: 'Dashboard' },
 *     { label: 'Analysis' }
 *   ]}
 * />
 * 
 * @example
 * // Breadcrumb con variante minimal
 * <Breadcrumb
 *   variant="minimal"
 *   separator="›"
 *   items={[
 *     { label: 'Inicio', url: '/' },
 *     { label: 'Configuración' }
 *   ]}
 * />
 */

import { component$, type JSXOutput } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils/cn';

/**
 * Definición de variantes del Breadcrumb mediante CVA.
 * 
 * Base: Clases compartidas (layout, spacing).
 * Variants: Estilos visuales (default, minimal).
 * 
 * Razón del Patrón: CVA previene desincronización entre tipos y clases.
 */
const breadcrumbVariants = cva(
  // Base: Aplicado a TODOS los breadcrumbs
  'flex items-center gap-2',
  {
    variants: {
      variant: {
        // Default: Estilo estándar con contraste completo
        default: 'text-sm text-muted-foreground',
        
        // Minimal: Estilo sutil con menos contraste
        minimal: 'text-xs text-muted-foreground/60',
      },
      size: {
        // SM: Texto más pequeño, menor spacing
        sm: 'text-xs gap-1.5',
        
        // Default: Tamaño estándar
        default: 'text-sm gap-2',
        
        // LG: Texto más grande, mayor spacing
        lg: 'text-base gap-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Estructura de un item individual del breadcrumb.
 */
export interface BreadcrumbItem {
  /** Texto a mostrar */
  label: string;
  
  /** URL de navegación (opcional para el último item) */
  url?: string;
  
  /** Ícono opcional (componente JSX) */
  icon?: () => JSXOutput;
}

/**
 * Props del Breadcrumb con tipado automático de variantes.
 * 
 * VariantProps<> infiere automáticamente los tipos desde breadcrumbVariants.
 */
export interface BreadcrumbProps extends VariantProps<typeof breadcrumbVariants> {
  /** Lista de items del breadcrumb (mínimo 1) */
  items: BreadcrumbItem[];
  
  /** Clases CSS adicionales (composición vía cn()) */
  class?: string;
  
  /** Carácter separador personalizado (default: '/') */
  separator?: string;
  
  /** Label accesible para el nav (default: 'Breadcrumb') */
  'aria-label'?: string;
}

/**
 * Breadcrumb Component - Export Principal
 * 
 * Renderiza navegación jerárquica con separadores y estados interactivos.
 * 
 * Comportamiento:
 * - Links intermedios: navegables con hover states + focus ring
 * - Último item: texto plano sin interacción (aria-current="page")
 * - Separadores: automáticos entre items (aria-hidden para A11y)
 * - Responsive: se mantiene en una línea, puede truncar con ellipsis si necesario
 * 
 * Separación de Responsabilidades:
 * - Este componente maneja SOLO la UI del breadcrumb
 * - La detección de ruta activa se hace en el padre (mediante items)
 * - No tiene estado interno (stateless component)
 */
export const Breadcrumb = component$<BreadcrumbProps>(
  ({
    items,
    variant,
    size,
    class: className,
    separator = '/',
    'aria-label': ariaLabel = 'Breadcrumb',
  }) => {
    return (
      <nav
        aria-label={ariaLabel}
        class={cn(breadcrumbVariants({ variant, size }), className)}
      >
        <ol class="flex items-center gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const Icon = item.icon;

            return (
              <li key={`${item.label}-${index}`} class="flex items-center gap-2">
                {/* Link navegable (si tiene URL y no es el último) */}
                {item.url && !isLast ? (
                  <Link
                    href={item.url}
                    class={cn(
                      'inline-flex items-center gap-1.5 hover:text-foreground transition-colors duration-200',
                      'hover:underline focus:text-foreground focus:underline',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      'rounded-sm px-1 -mx-1'
                    )}
                  >
                    {Icon && <Icon />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  /* Último item: texto plano sin link */
                  <span
                    class={cn(
                      'inline-flex items-center gap-1.5',
                      isLast && 'font-medium text-foreground'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {Icon && <Icon />}
                    <span>{item.label}</span>
                  </span>
                )}

                {/* Separador (no se muestra después del último item) */}
                {!isLast && (
                  <span
                    class="text-muted-foreground/40 select-none"
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);