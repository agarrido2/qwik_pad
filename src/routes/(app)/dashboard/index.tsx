/**
 * Dashboard Index - Página principal del dashboard
 * Muestra bienvenida, métricas demo y estado del workspace
 */

import { component$, useContext } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import { Card, CardContent, CardHeader, CardTitle, Alert, Button } from '~/components/ui';
import { MetricCard, RecentCallsTable, type CallRecord } from '~/components/dashboard';
import { AuthContext } from '~/lib/context/auth.context';
import { useAppGuard } from '../layout';
import { isAdminOrAbove } from '~/lib/auth/guards';
import { cn } from '~/lib/utils/cn';

/**
 * Datos dummy de llamadas recientes
 * Estructura como si vinieran de una API
 */
const DEMO_CALLS: CallRecord[] = [
  {
    id: 'call-001',
    timestamp: 'Hace 15 min',
    phoneNumber: '+34 612 345 678',
    duration: '3:12',
    reason: 'sales',
    resolved: true,
  },
  {
    id: 'call-002',
    timestamp: 'Hace 42 min',
    phoneNumber: '+34 698 765 432',
    duration: '1:45',
    reason: 'support',
    resolved: false,
  },
  {
    id: 'call-003',
    timestamp: 'Hace 1h',
    phoneNumber: '+34 655 123 789',
    duration: '4:20',
    reason: 'sales',
    resolved: true,
  },
  {
    id: 'call-004',
    timestamp: 'Hace 2h',
    phoneNumber: '+34 611 987 654',
    duration: '2:08',
    reason: 'info',
    resolved: true,
  },
  {
    id: 'call-005',
    timestamp: 'Hace 3h',
    phoneNumber: '+34 622 456 123',
    duration: '5:33',
    reason: 'complaint',
    resolved: false,
  },
];

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
          <a href="/dashboard/settings" class="ml-1 font-semibold underline">
            Actualiza a un plan de pago
          </a>{' '}
          para conectar tu número de teléfono real.
        </Alert>
      )}

      {/* Métricas rápidas - Grid responsive (2 cols móvil, 4 desktop) */}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {auth.isPreviewMode ? (
          <>
            <MetricCard
              title="Llamadas hoy"
              value={12}
              trend={13}
              icon="phone"
              color="primary"
            />
            <MetricCard
              title="Tasa de resolución"
              value="87%"
              trend={5}
              icon="check-circle"
              color="success"
            />
            <MetricCard
              title="Tiempo promedio"
              value="2:34"
              trend={-8}
              icon="clock"
              color="warning"
            />
            <MetricCard
              title="Leads generados"
              value={4}
              trend={55}
              icon="sparkles"
              color="neutral"
            />
          </>
        ) : (
          <>
            {/* Métricas vacías cuando no hay modo demo */}
            <MetricCard
              title="Llamadas hoy"
              value="—"
              icon="phone"
              color="neutral"
            />
            <MetricCard
              title="Tasa de resolución"
              value="—"
              icon="check-circle"
              color="neutral"
            />
            <MetricCard
              title="Tiempo promedio"
              value="—"
              icon="clock"
              color="neutral"
            />
            <MetricCard
              title="Leads generados"
              value="—"
              icon="sparkles"
              color="neutral"
            />
          </>
        )}
      </div>

      {/* Últimas llamadas */}
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Actividad reciente</CardTitle>
            
            {/* Botón demo: Deshabilitado para members */}
            <Link href="/dashboard/agents/new">
              <Button
                size="sm"
                variant="outline"
                disabled={!isAdminOrAbove(auth.organization.role)}
                aria-label={!isAdminOrAbove(auth.organization.role) ? 'Solo owners y admins pueden crear agentes' : 'Crear nuevo agente'}
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Agente
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <RecentCallsTable
            calls={auth.isPreviewMode ? DEMO_CALLS : []}
            emptyMessage="No hay llamadas registradas. Conecta tu número para empezar."
          />
        </CardContent>
      </Card>
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
