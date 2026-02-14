/**
 * LiveDemoSection - Sección interactiva de demostración con DemoWidget
 * 
 * Layout 2 columnas: Grid de sectores (izq) + DemoWidget funcional (der).
 * Recibe las actions del route como props (Orchestrator Pattern).
 * 
 * DECISIÓN ARQUITECTÓNICA: Props tipadas como `any` para las actions
 * porque ActionStore<T, I, true> tiene limitaciones de covarianza al 
 * pasarse como props entre componentes. Ver DemoWidget.tsx para detalles.
 */

import { component$ } from '@builder.io/qwik';
import { DemoWidget } from '~/features/demo/components/DemoWidget';

/** Sectores visibles en el grid bento de la demo */
const DEMO_SECTORS = [
  {
    id: 'concesionario',
    name: 'Concesionarios',
    description: 'Gestiona consultas de stock y agenda test drives',
    emoji: '🚗',
  },
  {
    id: 'inmobiliaria',
    name: 'Inmobiliarias',
    description: 'Atiende visitas y responde sobre propiedades',
    emoji: '🏠',
  },
  {
    id: 'retail',
    name: 'Retail',
    description: 'Informa sobre productos y disponibilidad',
    emoji: '🛒',
  },
  {
    id: 'alquiladora',
    name: 'Alquiladoras',
    description: 'Informa disponibilidad y condiciones de alquiler',
    emoji: '🚛',
  },
  {
    id: 'sat',
    name: 'Servicios SAT',
    description: 'Recibe incidencias y programa intervenciones',
    emoji: '🔧',
  },
] as const;

/**
 * Props: Las actions se tipan como `any` por limitación de covarianza
 * de ActionStore al pasar entre componentes. Ver DemoWidget.tsx § Props.
 */
interface LiveDemoSectionProps {
  requestAction: any;
  verifyAction: any;
}

export const LiveDemoSection = component$<LiveDemoSectionProps>(({ requestAction, verifyAction }) => {
  return (
    <section id="live-demo" class="bg-linear-to-br from-primary-50 to-white py-20">
      <div class="content-container">
        
        {/* Hero */}
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <h2 class="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
            Prueba nuestro agente de IA ahora
          </h2>
          <p class="text-lg text-neutral-600">
            Descubre cómo tu negocio puede automatizar llamadas. Selecciona tu sector 
            y recibirás una llamada en menos de 30 segundos.
          </p>
        </div>

        {/* 2 Column Layout: Sectores Grid (Left) + DemoWidget (Right) */}
        <div class="grid gap-8 lg:grid-cols-[2fr,1fr]">
          
          {/* LEFT BLOCK: Grid Bento de sectores */}
          <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {DEMO_SECTORS.map((sector) => (
              <div 
                key={sector.id}
                class="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
              >
                {/* Icon/Image Area con gradiente de marca */}
                <div class="flex h-28 items-center justify-center bg-linear-to-br from-primary-50 to-accent-50">
                  <span class="text-4xl" aria-hidden="true">{sector.emoji}</span>
                </div>
                
                {/* Content: Título + Descripción breve */}
                <div class="p-4">
                  <h3 class="mb-1 text-sm font-semibold text-neutral-900">
                    {sector.name}
                  </h3>
                  <p class="text-xs text-neutral-600">
                    {sector.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT BLOCK: DemoWidget funcional con 2-step verification */}
          <DemoWidget 
            requestAction={requestAction} 
            verifyAction={verifyAction} 
          />
        </div>
      </div>
    </section>
  );
});
