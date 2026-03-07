/**
 * Dashboard Index - Página principal del dashboard
 * Muestra bienvenida, métricas demo y estado del workspace
 */

import { component$, useContext } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';


import { AuthContext } from '~/lib/context/auth.context';
import { useAppGuard } from '../layout';

import { cn } from '~/lib/utils/cn';
import { Alert } from '~/components/ui/alert';


export default component$(() => {
  const appData = useAppGuard();
  const auth = useContext(AuthContext);

  return (
    <div class="space-y-6">
      {/* Encabezado de bienvenida */}
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">
          Hola, {appData.value.user.fullName || 'usuario'} 👋
          <span class={cn(
            'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium align-middle',
            auth.organization.roleBadgeColor,
          )}>
            {auth.organization.roleLabel}
          </span>
        </h1>
      </div>

      {/* Banner modo demo */}
      {auth.isPreviewMode && (
        <Alert variant="info" title="Modo Demo">
          Estás usando el plan Free con datos de demostración.
          <a href="/dashboard/facturacion" class="ml-1 font-semibold underline">
            Actualiza a un plan de pago
          </a>{' '}
          para conectar tu número de teléfono real.
        </Alert>
      )}

      {/* Métricas rápidas - Grid responsive (2 cols móvil, 4 desktop) */}
    

      {/* Últimas llamadas */}
      
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard - Onucall',
  meta: [
    {
      name: 'description',
      content: 'Panel de control de Onucall. Monitoriza llamadas, revisa métricas de tu asistente IA y gestiona tu workspace en tiempo real.',
    },
    // Open Graph
    {
      property: 'og:title',
      content: 'Dashboard - Onucall',
    },
    {
      property: 'og:description',
      content: 'Panel de control de Onucall. Monitoriza llamadas, revisa métricas de tu asistente IA y gestiona tu workspace en tiempo real.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://onucall.com/dashboard',
    },
    {
      property: 'og:image',
      content: 'https://onucall.com/og-dashboard.png',
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    // Twitter Card
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: 'Dashboard - Onucall',
    },
    {
      name: 'twitter:description',
      content: 'Panel de control de Onucall. Monitoriza llamadas, revisa métricas de tu asistente IA y gestiona tu workspace en tiempo real.',
    },
    {
      name: 'twitter:image',
      content: 'https://onucall.com/og-dashboard.png',
    },
  ],
  links: [
    {
      rel: 'canonical',
      href: 'https://onucall.com/dashboard',
    },
  ],
};
