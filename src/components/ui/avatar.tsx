/**
 * Avatar Component - Sistema de Diseño UI
 *
 * Muestra la imagen del usuario o un fallback con iniciales calculadas
 * automáticamente a partir de `name` (o `email` si no hay nombre).
 *
 * Patrón: CVA para variantes de tamaño y esquema de color.
 * Resumable: Componente puro sin estado ni side-effects.
 *
 * @example
 * // Avatar con imagen
 * <Avatar src="/avatars/user.jpg" name="Ana García" size="md" />
 *
 * @example
 * // Avatar con fallback de iniciales
 * <Avatar name="Ana García" size="lg" />
 *
 * @example
 * // Avatar solo con email (fallback: primera letra)
 * <Avatar name="ana@example.com" size="sm" color="neutral" />
 */

import { component$ } from '@builder.io/qwik';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils/cn';

// ============================================================================
// CVA VARIANTS
// ============================================================================

const avatarVariants = cva(
  // Base: Forma circular, centrado, texto en negrita
  'inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none',
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
      },
      color: {
        primary: 'bg-primary-100 text-primary-700',
        neutral: 'bg-neutral-100 text-neutral-700',
      },
    },
    defaultVariants: {
      size: 'sm',
      color: 'primary',
    },
  },
);

// ============================================================================
// TYPES
// ============================================================================

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** Nombre completo o email del usuario — se usan para calcular iniciales */
  name: string;
  /** URL de imagen del usuario (cuando exista) */
  src?: string;
  /** Alt text para la imagen (default: name) */
  alt?: string;
  /** Clases CSS adicionales */
  class?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extrae hasta 2 iniciales de un nombre completo.
 * Fallback: primera letra del string (email, etc.)
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Una sola palabra o email → primera letra
  return name.slice(0, 1).toUpperCase();
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Avatar = component$<AvatarProps>(
  ({ name, src, alt, size, color, class: className }) => {
    if (src) {
      return (
        <img
          src={src}
          alt={alt || name}
          class={cn(avatarVariants({ size, color }), 'object-cover', className)}
          width={40}
          height={40}
        />
      );
    }

    return (
      <div
        class={cn(avatarVariants({ size, color }), className)}
        aria-hidden="true"
        title={name}
      >
        {getInitials(name)}
      </div>
    );
  },
);
