/**
 * HeroSection - Cabecera principal de la landing page
 * 
 * Sección de apertura con headline, tagline y CTAs primarios.
 * Gradiente de marca + badge de categoría.
 * 
 * Componente puro sin props: todo el contenido es estático.
 */

import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const HeroSection = component$(() => {
  return (
    <section class="relative overflow-hidden bg-linear-to-br from-primary-50 via-white to-primary-50/30 py-20 md:py-32">
      <div class="content-container">
        <div class="mx-auto max-w-3xl text-center">
          <span class="mb-4 inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
            Agentes de Voz con IA 
          </span>
          <h1 class="mb-12 text-4xl font-bold tracking-tight text-neutral-900 md:text-6xl">
            Tu negocio atendido{' '}
            <span class="text-primary-600">24/7</span>{' '}
            con inteligencia artificial
          </h1>
          <p class="mb-8 text-lg text-neutral-600 md:text-xl">
            Onucall crea agentes de voz IA que atienden llamadas, agendan citas
            y resuelven consultas. Sin esperas, sin horarios, sin límites.
          </p>
          <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              class="inline-flex h-12 items-center justify-center rounded-lg bg-primary-600 px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-700"
            >
              Comenzar gratis
            </Link>
            <a
              href="#features"
              class="inline-flex h-12 items-center justify-center rounded-lg border-2 border-neutral-300 px-8 text-base font-semibold text-neutral-700 transition-colors hover:border-primary-400 hover:text-primary-600"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
