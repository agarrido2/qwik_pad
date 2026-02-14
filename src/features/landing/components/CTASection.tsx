/**
 * CTASection - Call to Action final de la landing page
 * 
 * Fondo primario sólido con headline + CTA de registro.
 * Contenido estático, sin props ni estado.
 */

import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const CTASection = component$(() => {
  return (
    <section id="contact" class="bg-primary-600 py-20 text-white">
      <div class="content-container">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold">
            ¿Listo para automatizar tu atención telefónica?
          </h2>
          <p class="mb-8 text-lg text-primary-100">
            Crea tu cuenta gratis en menos de 2 minutos. Sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            class="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-primary-700 shadow-md transition-colors hover:bg-primary-50"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </section>
  );
});
