/**
 * Dashboard Appointments - Listado de citas
 * @description Vista administrativa de reservas por organización.
 * La ruta solo orquesta datos (SSR) y delega toda lógica de negocio al SchedulingService.
 */

import { component$ } from '@builder.io/qwik';
import { Link, routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { Alert, Card, CardContent, CardHeader, CardTitle } from '~/components/ui';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { AuthService } from '~/lib/services/auth.service';
import { RBACService } from '~/lib/services/rbac.service';
import { SchedulingService } from '~/lib/services/scheduling.service';
import { cn } from '~/lib/utils/cn';

/**
 * Loader SSR: obtiene citas de la organización activa.
 *
 * Reutiliza sharedMap para evitar queries duplicadas de userOrgs dentro del mismo request.
 */
export const useAppointmentsLoader = routeLoader$(async (requestEvent) => {
  const authUser = await AuthService.getAuthUser(requestEvent);
  if (!authUser) {
    throw requestEvent.redirect(302, '/login');
  }

  let orgs = requestEvent.sharedMap.get('userOrgs') as
    | Awaited<ReturnType<typeof RBACService.getUserOrganizationsWithRoles>>
    | undefined;

  if (!orgs) {
    orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
    requestEvent.sharedMap.set('userOrgs', orgs);
  }

  if (orgs.length === 0) {
    throw requestEvent.redirect(302, '/onboarding');
  }

  const activeOrg = resolveActiveOrg(requestEvent, orgs);
  const appointmentRows = await SchedulingService.getAppointmentsByOrg(activeOrg.id);

  return {
    organizationName: activeOrg.name,
    appointments: appointmentRows,
  };
});

/**
 * Página de administración de citas.
 */
export default component$(() => {
  const data = useAppointmentsLoader();

  const getStatusLabel = (status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    if (status === 'PENDING') return 'Pendiente';
    if (status === 'CONFIRMED') return 'Confirmada';
    return 'Cancelada';
  };

  const getStatusClass = (status: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    if (status === 'PENDING') return 'bg-amber-100 text-amber-800';
    if (status === 'CONFIRMED') return 'bg-emerald-100 text-emerald-800';
    return 'bg-rose-100 text-rose-800';
  };

  const formatDateTime = (value: string | Date) => {
    const parsedDate = value instanceof Date ? value : new Date(value);

    return parsedDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-neutral-900">Citas</h1>
        <p class="mt-1 text-sm text-neutral-600">
          Gestión de reservas para {data.value.organizationName}.
        </p>
      </header>

      {data.value.appointments.length === 0 ? (
        <Alert variant="info" title="Sin citas registradas">
          Todavía no hay reservas para esta organización.
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Listado de citas ({data.value.appointments.length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-neutral-200">
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Cliente</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Departamento</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Operario</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Inicio</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Fin</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-700">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {data.value.appointments.map((appointment) => (
                    <tr key={appointment.id} class="border-b border-neutral-100 hover:bg-neutral-50">
                      <td class="py-3 px-4">
                        <div>
                          <Link
                            href={`/dashboard/appointments/${appointment.id}`}
                            class="text-sm font-medium text-neutral-900 hover:text-primary-700"
                          >
                            {appointment.clientName}
                          </Link>
                          <p class="text-xs text-neutral-500">{appointment.clientPhone}</p>
                        </div>
                      </td>

                      <td class="py-3 px-4 text-sm text-neutral-700">{appointment.departmentName}</td>

                      <td class="py-3 px-4 text-sm text-neutral-700">
                        {appointment.operatorName ?? 'Sin asignar'}
                      </td>

                      <td class="py-3 px-4 text-sm text-neutral-700">
                        {appointment.startAt ? formatDateTime(appointment.startAt) : (
                          appointment.callbackPreferredAt
                            ? <span class="text-amber-600">Callback ~{formatDateTime(appointment.callbackPreferredAt)}</span>
                            : <span class="text-neutral-400">Sin hora fija</span>
                        )}
                      </td>

                      <td class="py-3 px-4 text-sm text-neutral-700">
                        {appointment.endAt ? formatDateTime(appointment.endAt) : '—'}
                      </td>

                      <td class="py-3 px-4">
                        <span
                          class={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            getStatusClass(appointment.status),
                          )}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Citas - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Panel de administración de citas y reservas de la organización en Onucall.',
    },
  ],
};
