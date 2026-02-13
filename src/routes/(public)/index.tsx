/**
 * Landing Page - Página principal pública de Onucall
 * Hero, Features, Sectores, Pricing, CTA
 */

import { component$ } from '@builder.io/qwik';
import { Link, routeAction$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { DemoWidget } from '~/features/demo/components/DemoWidget';
import { demoFormSchema } from '~/features/demo/schemas/demo.schema';
import { verificationSchema } from '~/features/demo/schemas/verification.schema';
import { requestDemoVerification, verifyAndTriggerDemo } from '~/features/demo/services/demo.services';

/**
 * Action: Step 1 - Solicitar código de verificación
 * @description Orquesta el servicio requestDemoVerification (envía email con OTP)
 */
export const useDemoRequestAction = routeAction$(
  async (data, requestEvent) => {
    // Obtener IP del cliente para tracking anti-abuse
    const ipAddress = 
      requestEvent.headers.get('x-forwarded-for') || 
      requestEvent.headers.get('x-real-ip') || 
      'unknown';

    const result = await requestDemoVerification(requestEvent, data, ipAddress);

    if (!result.success) {
      return requestEvent.fail(400, {
        message: result.error || 'Error al procesar la solicitud',
      });
    }

    // Retornar email para el Step 2 (modal de verificación)
    return { success: true, email: data.email };
  },
  zod$(demoFormSchema)
);

/**
 * Action: Step 2 - Verificar código OTP y disparar llamada
 * @description Orquesta el servicio verifyAndTriggerDemo (valida + llama Retell)
 */
export const useVerifyCodeAction = routeAction$(
  async (data, requestEvent) => {
    const result = await verifyAndTriggerDemo(
      requestEvent,
      data.email,
      data.code
    );

    if (!result.success) {
      return requestEvent.fail(400, {
        message: result.error || 'Código inválido',
      });
    }

    return { success: true, callId: result.callId };
  },
  zod$(verificationSchema)
);

export default component$(() => {
  // Actions para el flujo de demo (2 pasos)
  const demoRequestAction = useDemoRequestAction();
  const verifyCodeAction = useVerifyCodeAction();

  return (
    <>
      {/* Hero Section */}
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

      {/* Features Section */}
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
            {[
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
            ].map((feature) => (
              <div key={feature.title} class="rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
                <span class="mb-4 block text-3xl" aria-hidden="true">{feature.icon}</span>
                <h3 class="mb-2 text-lg font-semibold text-neutral-900">{feature.title}</h3>
                <p class="text-sm text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section - ACTUALIZADO: Widget funcional con 2-step verification */}
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
            
            {/* LEFT BLOCK: Grid Bento de 5 Sectores (2x3) */}
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[
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
              ].map((sector) => (
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
              requestAction={demoRequestAction} 
              verifyAction={verifyCodeAction} 
            />
          </div>
        </div>
      </section>

      {/* Sectores */}
      <section class="bg-neutral-50 py-20">
        <div class="content-container">
          <div class="mx-auto mb-12 max-w-2xl text-center">
            <h2 class="mb-4 text-3xl font-bold text-neutral-900">
              Diseñado para tu sector
            </h2>
            <p class="text-lg text-neutral-600">
              Agentes preconfigurados para las necesidades de cada industria.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🚗', name: 'Concesionarios' },
              { icon: '🏠', name: 'Inmobiliarias' },
              { icon: '🚛', name: 'Alquiladoras' },
              { icon: '⚖️', name: 'Despachos' },
              { icon: '🛒', name: 'Retail' },
              { icon: '🔧', name: 'Servicio Técnico' },
              { icon: '🏥', name: 'Clínicas' },
              { icon: '✨', name: '¿Otro sector?' },
            ].map((sector) => (
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

      {/* Pricing */}
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

      {/* CTA Final */}
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
    </>
  );
});

export const head: DocumentHead = {
  title: 'Onucall - Agentes de Voz con IA para tu Negocio',
  meta: [
    // Meta Description
    {
      name: 'description',
      content: 'Onucall crea agentes de voz IA que atienden llamadas 24/7, agendan citas y resuelven consultas para concesionarios, inmobiliarias, clínicas y todo tipo de negocios.',
    },
    
    // ===== OPEN GRAPH (Facebook, LinkedIn, WhatsApp) =====
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:site_name',
      content: 'Onucall',
    },
    {
      property: 'og:title',
      content: 'Onucall - Agentes de Voz con IA para tu Negocio',
    },
    {
      property: 'og:description',
      content: 'Automatiza tu atención telefónica con inteligencia artificial. Sin horarios, sin límites. Prueba gratis.',
    },
    {
      property: 'og:url',
      content: 'https://onucall.com/',
    },
    {
      property: 'og:image',
      content: 'https://onucall.com/og-image-home.jpg',
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:image:alt',
      content: 'Onucall - Agentes de Voz IA para automatizar tu atención telefónica',
    },
    {
      property: 'og:locale',
      content: 'es_ES',
    },

    // ===== TWITTER CARDS =====
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: 'Onucall - Agentes de Voz con IA',
    },
    {
      name: 'twitter:description',
      content: 'Tu negocio atendido 24/7 con inteligencia artificial. Agentes de voz que agendan citas y resuelven consultas.',
    },
    {
      name: 'twitter:image',
      content: 'https://onucall.com/og-image-home.jpg',
    },
    {
      name: 'twitter:image:alt',
      content: 'Onucall - Agentes de Voz IA',
    },

    // ===== SCHEMA.ORG (Datos Estructurados) =====
    {
      key: 'schema-organization',
      property: 'innerHTML',
      content: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Onucall",
  "url": "https://onucall.com",
  "logo": "https://onucall.com/logo.png",
  "description": "Plataforma de agentes de voz con inteligencia artificial para automatizar la atención telefónica de negocios",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Atención al Cliente",
    "email": "hola@onucall.com"
  }
}
</script>`,
    },
    {
      key: 'schema-product',
      property: 'innerHTML',
      content: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Onucall",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "Plan gratuito disponible"
  }
}
</script>`,
    },
  ],
  links: [
    // ===== CANONICAL URL =====
    {
      rel: 'canonical',
      href: 'https://onucall.com/',
    },
  ],
};
