/**
 * Landing Page - Página principal pública de Onucall
 * 
 * ORCHESTRATOR PATTERN: Este archivo coordina secciones y actions,
 * sin implementar UI directa. Cada sección vive en features/landing/.
 * 
 * Secciones: Hero → Features → LiveDemo → Sectors → Pricing → CTA
 */

import { component$ } from '@builder.io/qwik';
import { routeAction$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { demoFormSchema } from '~/features/demo/schemas/demo.schema';
import { verificationSchema } from '~/features/demo/schemas/verification.schema';
import { requestDemoVerification, verifyAndTriggerDemo } from '~/features/demo/services/demo.services';
import {
  HeroSection,
  FeaturesSection,
  LiveDemoSection,
  SectorsSection,
  PricingSection,
  CTASection,
} from '~/features/landing';

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
      <HeroSection />
      <FeaturesSection />
      <LiveDemoSection requestAction={demoRequestAction} verifyAction={verifyCodeAction} />
      <SectorsSection />
      <PricingSection />
      <CTASection />
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
