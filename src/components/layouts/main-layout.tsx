import { component$, Slot } from '@builder.io/qwik';
import { Container } from '~/components/ui/container';

/**
 * MainLayout - Para páginas públicas (landing, pricing, etc.)
 */
export const MainLayout = component$(() => {
  return (
    <div class="flex min-h-screen flex-col">
      {/* Header */}
      <header class="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <Container>
          <nav class="flex h-16 items-center justify-between" role="navigation" aria-label="Navegación principal">
            <div class="flex items-center gap-8">
              <a href="/" class="text-xl font-bold text-primary-600" aria-label="Onucall - Inicio">
                Onucall
              </a>
              
              <div class="hidden items-center gap-6 md:flex">
                <a href="#features" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
                  Características
                </a>
                <a href="#pricing" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
                  Precios
                </a>
                <a href="#contact" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
                  Contacto
                </a>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <a
                href="/login"
                class="hidden sm:inline-flex text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                class="inline-flex h-9 items-center justify-center rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Comenzar gratis
              </a>
            </div>
          </nav>
        </Container>
      </header>

      {/* Main Content */}
      <main class="flex-1">
        <Slot />
      </main>

      {/* Footer */}
      <footer class="border-t border-neutral-200 bg-neutral-50">
        <Container>
          <div class="py-8 md:py-12">
            <div class="grid gap-8 md:grid-cols-4">
              <div>
                <h3 class="mb-3 text-sm font-semibold text-neutral-900">Producto</h3>
                <ul class="space-y-2 text-sm text-neutral-600">
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Características</a></li>
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Precios</a></li>
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Casos de uso</a></li>
                </ul>
              </div>

              <div>
                <h3 class="mb-3 text-sm font-semibold text-neutral-900">Empresa</h3>
                <ul class="space-y-2 text-sm text-neutral-600">
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Sobre nosotros</a></li>
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Blog</a></li>
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Contacto</a></li>
                </ul>
              </div>

              <div>
                <h3 class="mb-3 text-sm font-semibold text-neutral-900">Legal</h3>
                <ul class="space-y-2 text-sm text-neutral-600">
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Privacidad</a></li>
                  <li><a href="#" class="hover:text-primary-600 transition-colors">Términos</a></li>
                </ul>
              </div>

              <div>
                <h3 class="mb-3 text-sm font-semibold text-neutral-900">Onucall</h3>
                <p class="text-sm text-neutral-600">
                  Agentes de voz con IA para tu negocio.
                </p>
              </div>
            </div>

            <div class="mt-8 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500">
              © {new Date().getFullYear()} Onucall. Todos los derechos reservados.
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
});
