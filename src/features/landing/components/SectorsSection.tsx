/**
 * SectorsSection - Grid de sectores soportados por Onucall
 * 
 * 8 sectores en grid responsive (2→4 cols).
 * Incluye slot "¿Otro sector?" como CTA implícito.
 * Contenido estático, sin props ni estado.
 */

import { component$ } from '@builder.io/qwik';

/** Lista completa de sectores (7 + wildcard) */
const SECTORS = [
  { icon: '🚗', name: 'Concesionarios' },
  { icon: '🏠', name: 'Inmobiliarias' },
  { icon: '🚛', name: 'Alquiladoras' },
  { icon: '⚖️', name: 'Despachos' },
  { icon: '🛒', name: 'Retail' },
  { icon: '🔧', name: 'Servicio Técnico' },
  { icon: '🏥', name: 'Clínicas' },
  { icon: '✨', name: '¿Otro sector?' },
] as const;

export const SectorsSection = component$(() => {
  return (
    <section class="bg-neutral-50 py-20">
      <div class="content-container">
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-neutral-900">
            Diseñado para tu sector
          </h2>
          <p class="text-lg text-neutral-600">
            Agentes preconfigurados para las necesidades de cada sector.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector) => (
            <div
              key={sector.name}
              class="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
            >
              <span class="text-2xl" aria-hidden="true">{sector.icon}</span>
              <span class="text-sm font-medium text-neutral-800">{sector.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
