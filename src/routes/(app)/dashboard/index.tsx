/**
 * Dashboard Index - Página principal del dashboard
 * Muestra bienvenida, métricas demo y estado del workspace
 */

import { component$, useContext } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { Card, CardContent, CardHeader, CardTitle, Alert } from '~/components/ui';
import { OrganizationContext } from '~/lib/context/organization.context';
import { useAppGuard } from '../layout';

export default component$(() => {
  const appData = useAppGuard();
  const orgCtx = useContext(OrganizationContext);

  return (
    <div class="space-y-6">
      {/* Encabezado de bienvenida */}
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">
          Hola, {appData.value.user.fullName || 'usuario'} 👋
        </h1>
        <p class="mt-1 text-sm text-neutral-600">
          Workspace: <strong>{orgCtx.active.name}</strong>
          {orgCtx.isMultiOrg && (
            <span class="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
              Multi-org
            </span>
          )}
        </p>
      </div>

      {/* Banner modo demo */}
      {orgCtx.isPreviewMode && (
        <Alert variant="info" title="Modo Demo">
          Estás usando el plan Free con datos de demostración.
          <a href="/dashboard/settings" class="ml-1 font-semibold underline">
            Actualiza a un plan de pago
          </a>{' '}
          para conectar tu número de teléfono real.
        </Alert>
      )}

      {/* Métricas rápidas */}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-neutral-500">Llamadas hoy</p>
                <p class="mt-1 text-3xl font-bold text-neutral-900">
                  {orgCtx.isPreviewMode ? '12' : '—'}
                </p>
              </div>
              <div class="rounded-lg bg-primary-100 p-3">
                <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-neutral-500">Tasa de resolución</p>
                <p class="mt-1 text-3xl font-bold text-neutral-900">
                  {orgCtx.isPreviewMode ? '87%' : '—'}
                </p>
              </div>
              <div class="rounded-lg bg-green-100 p-3">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-neutral-500">Tiempo promedio</p>
                <p class="mt-1 text-3xl font-bold text-neutral-900">
                  {orgCtx.isPreviewMode ? '2:34' : '—'}
                </p>
              </div>
              <div class="rounded-lg bg-yellow-100 p-3">
                <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-neutral-500">Agentes activos</p>
                <p class="mt-1 text-3xl font-bold text-neutral-900">
                  {orgCtx.isPreviewMode ? '1' : '—'}
                </p>
              </div>
              <div class="rounded-lg bg-purple-100 p-3">
                <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas llamadas (demo) */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas llamadas</CardTitle>
        </CardHeader>
        <CardContent>
          {orgCtx.isPreviewMode ? (
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-neutral-200 text-left">
                    <th class="px-4 py-3 font-medium text-neutral-500">Llamante</th>
                    <th class="px-4 py-3 font-medium text-neutral-500">Duración</th>
                    <th class="px-4 py-3 font-medium text-neutral-500">Estado</th>
                    <th class="px-4 py-3 font-medium text-neutral-500">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-neutral-100">
                    <td class="px-4 py-3">+34 612 345 678</td>
                    <td class="px-4 py-3">3:12</td>
                    <td class="px-4 py-3">
                      <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Resuelta</span>
                    </td>
                    <td class="px-4 py-3 text-neutral-500">Hace 15 min</td>
                  </tr>
                  <tr class="border-b border-neutral-100">
                    <td class="px-4 py-3">+34 698 765 432</td>
                    <td class="px-4 py-3">1:45</td>
                    <td class="px-4 py-3">
                      <span class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Derivada</span>
                    </td>
                    <td class="px-4 py-3 text-neutral-500">Hace 42 min</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3">+34 655 123 789</td>
                    <td class="px-4 py-3">4:20</td>
                    <td class="px-4 py-3">
                      <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Resuelta</span>
                    </td>
                    <td class="px-4 py-3 text-neutral-500">Hace 1h</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p class="py-8 text-center text-sm text-neutral-500">
              No hay llamadas registradas aún. Conecta tu número para empezar.
            </p>
          )}
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
  ],
};
