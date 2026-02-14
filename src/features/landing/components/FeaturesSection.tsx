/**
 * FeaturesSection - Grid de funcionalidades de Onucall
 * 
 * 6 feature cards en grid responsive (1→2→3 cols).
 * Contenido estático, sin props ni estado.
 */

import { component$ } from '@builder.io/qwik';

/** Definición de features para renderizado declarativo */
const FEATURES = [
  {
    icon: '🤖',
    title: 'Agente IA personalizado',
    description: 'Configura el tono, idioma y conocimiento de tu agente según tu sector.',
  },
  {
    icon: '📞',
    title: 'Número virtual dedicado',
    description: 'Recibe llamadas en un número propio o transfiere tu número actual.',
  },
  {
    icon: '📊',
    title: 'Dashboard en tiempo real',
    description: 'Monitoriza llamadas, transcripciones y métricas desde cualquier dispositivo.',
  },
  {
    icon: '📅',
    title: 'Agenda inteligente',
    description: 'El agente agenda citas directamente en tu calendario sin intervención.',
  },
  {
    icon: '🧠',
    title: 'Base de conocimiento',
    description: 'Sube documentos y FAQ para que tu agente responda con precisión.',
  },
  {
    icon: '🔗',
    title: 'Integraciones',
    description: 'Conecta con tu CRM, calendario y herramientas de trabajo favoritas.',
  },
] as const;

export const FeaturesSection = component$(() => {
  return (
    <section id="features" class="py-20">
      <div class="content-container">
        <div class="mx-auto mb-16 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-neutral-900">
            Todo lo que necesitas para automatizar tu atención telefónica
          </h2>
          <p class="text-lg text-neutral-600">
            Configuración sencilla, resultados inmediatos.
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} class="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
              <span class="mb-4 block text-3xl" aria-hidden="true">{feature.icon}</span>
              <h3 class="mb-2 text-lg font-semibold text-neutral-900">{feature.title}</h3>
              <p class="text-sm text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
