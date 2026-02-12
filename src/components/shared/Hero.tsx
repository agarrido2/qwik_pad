import { component$, Slot, type PropsOf } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

/**
 * Hero - Sección principal de landing pages
 * 
 * Componente base para hero sections. Soporta:
 * - Contenido flexible via <Slot />
 * - Variantes de alineación (center, left)
 * - Background customizable via className
 * 
 * Pattern: Composition over Configuration.
 * El contenido (headline, CTA buttons, imágenes) se inyecta via children,
 * permitiendo máxima flexibilidad sin props innecesarias.
 * 
 * Ejemplo de uso:
 * ```tsx
 * <Hero variant="center" class="bg-gradient-to-br from-primary-50 to-white">
 *   <h1 class="text-5xl font-bold">Tu Headline</h1>
 *   <p class="text-xl">Tu subheadline</p>
 *   <div class="flex gap-4">
 *     <Button variant="default">CTA Principal</Button>
 *     <Button variant="outline">CTA Secundario</Button>
 *   </div>
 * </Hero>
 * ```
 */

interface HeroProps extends PropsOf<'section'> {
  /**
   * Variante de alineación del contenido.
   * - center: Texto centrado, ideal para mensajes cortos y directos
   * - left: Texto alineado a la izquierda, para layouts con imagen lateral
   */
  variant?: 'center' | 'left';
}

export const Hero = component$<HeroProps>(({ variant = 'center', class: className, ...props }) => {
  return (
    <section
      class={cn(
        'relative overflow-hidden py-16 md:py-24 lg:py-32',
        className
      )}
      {...props}
    >
      <div class="content-container">
        <div
          class={cn(
            'flex flex-col gap-6',
            variant === 'center' && 'items-center text-center',
            variant === 'left' && 'items-start text-left'
          )}
        >
          {/* Contenido inyectado via Slot */}
          <Slot />
        </div>
      </div>
    </section>
  );
});
