import { component$ } from '@builder.io/qwik';

/**
 * Footer - Pie de página para landing y páginas públicas
 * 
 * Arquitectura:
 * - Grid responsivo de 4 columnas (1 en mobile, 4 en desktop)
 * - Secciones: Producto, Empresa, Legal, Descripción
 * - Copyright dinámico con año actual
 * 
 * Patrón: Componente presentacional puro. En el futuro puede recibir props
 * para configurar enlaces desde CMS o routing dinámico.
 */
export const Footer = component$(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="border-t border-neutral-200 bg-neutral-50">
      <div class="content-container">
        <div class="py-8 md:py-12">
          {/* Footer Grid */}
          <div class="grid gap-8 md:grid-cols-4">
            {/* Producto */}
            <div>
              <h3 class="mb-3 text-sm font-semibold text-neutral-900">Producto</h3>
              <ul class="space-y-2 text-sm text-neutral-600">
                <li>
                  <a href="#features" class="hover:text-primary-600 transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#pricing" class="hover:text-primary-600 transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#use-cases" class="hover:text-primary-600 transition-colors">
                    Casos de uso
                  </a>
                </li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h3 class="mb-3 text-sm font-semibold text-neutral-900">Empresa</h3>
              <ul class="space-y-2 text-sm text-neutral-600">
                <li>
                  <a href="#about" class="hover:text-primary-600 transition-colors">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="#blog" class="hover:text-primary-600 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" class="hover:text-primary-600 transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 class="mb-3 text-sm font-semibold text-neutral-900">Legal</h3>
              <ul class="space-y-2 text-sm text-neutral-600">
                <li>
                  <a href="#privacy" class="hover:text-primary-600 transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#terms" class="hover:text-primary-600 transition-colors">
                    Términos
                  </a>
                </li>
              </ul>
            </div>

            {/* Branding */}
            <div>
              <h3 class="mb-3 text-sm font-semibold text-neutral-900">Onucall</h3>
              <p class="text-sm text-neutral-600">
                Agentes de voz con IA para tu negocio.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div class="mt-8 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500">
            © {currentYear} Onucall. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
});
