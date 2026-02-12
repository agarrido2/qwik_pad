import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

/**
 * Header - Cabecera principal para páginas públicas
 * 
 * Componente reutilizable que incluye:
 * - Logo de Onucall con link a home
 * - NavigationMenu con enlaces principales (Características, Precios, Contacto)
 * - Botones de autenticación (Login + CTA Registro)
 * 
 * Decisión arquitectónica: Sticky positioning y backdrop-blur para contexto de scroll.
 * MenuTop (NavigationMenu) está integrado inline para cohesión visual y gestión de estado.
 */
export const Header = component$(() => {
  return (
    <header class="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div class="content-container">
        <nav class="flex h-16 items-center justify-between" role="navigation" aria-label="Navegación principal">
          {/* Logo */}
          <div class="flex items-center gap-8">
            <Link href="/" class="text-xl font-bold text-primary-600" aria-label="Onucall - Inicio">
              Onucall
            </Link>
            
            {/* NavigationMenu (MenuTop integrado) */}
            <div class="hidden items-center gap-6 md:flex">
              <a 
                href="#features" 
                class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
              >
                Características
              </a>
              <a 
                href="#pricing" 
                class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
              >
                Precios
              </a>
              <a 
                href="#contact" 
                class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>

          {/* Auth Actions */}
          <div class="flex items-center gap-3">
            <Link
              href="/login"
              class="hidden sm:inline-flex text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              class="inline-flex h-9 items-center justify-center rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
});
