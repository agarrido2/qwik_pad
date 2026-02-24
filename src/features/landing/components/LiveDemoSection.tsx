/**
 * LiveDemoSection - Sección informativa de demostración.
 *
 * Tras el cambio de foco a Onucall Auto (concesionarios), la demo pública
 * se desactiva. Se mantiene esta sección como placeholder
 * de producto para no romper el layout de landing.
 */

import { component$ } from '@builder.io/qwik';

const ONUCALL_AUTO_VERTICAL = {
  name: 'Concesionarios de Vehículos',
  description: 'Captación 24/7, cualificación de leads y agendamiento de pruebas de conducción',
  emoji: '🚗',
} as const;

interface LiveDemoSectionProps {
  requestAction?: unknown;
  verifyAction?: unknown;
}

export const LiveDemoSection = component$<LiveDemoSectionProps>(() => {
  return (
    <section id="live-demo" class="bg-linear-to-br from-primary-50 to-white py-20">
      <div class="content-container">
        
        {/* Hero */}
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
            Prueba nuestro agente de IA ahora
          </h2>
          <p class="text-lg text-neutral-600">
            Onucall Auto está optimizado para concesionarios de vehículos.
            La demo pública se reactivará en una próxima iteración.
          </p>
        </div>

        <div class="grid gap-8">
          
          <div class="rounded-xl border border-neutral-200 bg-white p-6">
            <div class="flex items-center gap-4">
              <span class="text-4xl" aria-hidden="true">{ONUCALL_AUTO_VERTICAL.emoji}</span>
              <div>
                <h3 class="text-base font-semibold text-neutral-900">{ONUCALL_AUTO_VERTICAL.name}</h3>
                <p class="text-sm text-neutral-600">{ONUCALL_AUTO_VERTICAL.description}</p>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-neutral-200 bg-white p-6 text-center">
            <p class="text-sm text-neutral-600">
              Solicita una demo privada con el equipo comercial para ver el flujo completo de captación,
              cualificación y agendamiento para ventas de vehículos nuevos y de ocasión.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
