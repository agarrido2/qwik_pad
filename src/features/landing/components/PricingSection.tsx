/**
 * PricingSection - Tabla de precios con 3 planes
 * 
 * Grid de 3 columnas (Free, Starter, Pro).
 * Starter destacado con badge "Popular" y borde primario.
 * Contenido estático, sin props ni estado.
 */

import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const PricingSection = component$(() => {
  return (
    <section id="pricing" class="py-20">
      <div class="content-container">
        <div class="mx-auto mb-16 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-neutral-900">
            Planes simples, sin sorpresas
          </h2>
          <p class="text-lg text-neutral-600">
            Empieza gratis, escala cuando quieras.
          </p>
        </div>

        <div class="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {/* Free */}
          <div class="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 class="mb-2 text-lg font-semibold text-neutral-900">Free</h3>
            <p class="mb-4 text-sm text-neutral-600">Explora la plataforma con datos demo.</p>
            <p class="mb-6 text-3xl font-bold text-neutral-900">$0<span class="text-base font-normal text-neutral-500">/mes</span></p>
            <ul class="mb-8 space-y-2 text-sm text-neutral-700">
              <li class="flex items-center gap-2"><span class="text-success">✓</span> Dashboard completo</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> Datos demo del sector</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> Audio de ejemplo</li>
              <li class="flex items-center gap-2"><span class="text-neutral-400">—</span> Sin número real</li>
            </ul>
            <Link href="/register" class="block w-full rounded-lg border-2 border-primary-600 py-2.5 text-center text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">
              Empezar gratis
            </Link>
          </div>

          {/* Starter - Destacado */}
          <div class="relative rounded-xl border-2 border-primary-600 bg-white p-6 shadow-lg">
            <span class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
              Popular
            </span>
            <h3 class="mb-2 text-lg font-semibold text-neutral-900">Starter</h3>
            <p class="mb-4 text-sm text-neutral-600">Para negocios que quieren automatizar.</p>
            <p class="mb-6 text-3xl font-bold text-neutral-900">$49<span class="text-base font-normal text-neutral-500">/mes</span></p>
            <ul class="mb-8 space-y-2 text-sm text-neutral-700">
              <li class="flex items-center gap-2"><span class="text-success">✓</span> 1 número virtual</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> Agente IA personalizado</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> 500 minutos/mes</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> Transcripciones</li>
            </ul>
            <Link href="/register" class="block w-full rounded-lg bg-primary-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-700">
              Comenzar ahora
            </Link>
          </div>

          {/* Pro */}
          <div class="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 class="mb-2 text-lg font-semibold text-neutral-900">Pro</h3>
            <p class="mb-4 text-sm text-neutral-600">Para negocios en crecimiento.</p>
            <p class="mb-6 text-3xl font-bold text-neutral-900">$149<span class="text-base font-normal text-neutral-500">/mes</span></p>
            <ul class="mb-8 space-y-2 text-sm text-neutral-700">
              <li class="flex items-center gap-2"><span class="text-success">✓</span> 5 números virtuales</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> Múltiples agentes</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> 2000 minutos/mes</li>
              <li class="flex items-center gap-2"><span class="text-success">✓</span> Integraciones CRM</li>
            </ul>
            <Link href="/register" class="block w-full rounded-lg border-2 border-primary-600 py-2.5 text-center text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">
              Comenzar ahora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});
