/**
 * Dashboard Appointment Detail - Asignación de operario
 * @description Orquesta detalle de cita y confirmación de citas PENDING.
 */

import { component$ } from '@builder.io/qwik';
import { Form, Link, routeAction$, routeLoader$, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle } from '~/components/ui';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { AuthService } from '~/lib/services/auth.service';
import { RBACService } from '~/lib/services/rbac.service';
import { SchedulingService } from '~/lib/services/scheduling.service';
import { cn } from '~/lib/utils/cn';

/**
 * Loader SSR: detalle de cita + operarios asignables del departamento.
 */
export const useAppointmentDetailLoader = routeLoader$(async (requestEvent) => {
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
  const appointment = await SchedulingService.getAppointmentById(requestEvent.params.id, activeOrg.id);

  if (!appointment) {
    throw requestEvent.redirect(302, '/dashboard/appointments');
  }

  const assignableOperators = await SchedulingService.getAssignableOperatorsByDepartment(
    appointment.departmentId,
    activeOrg.id,
  );

  return {
    appointment,
    assignableOperators,
  };
});

/**
 * Action SSR: asigna operario y confirma cita PENDING.
 */
export const useAssignOperatorAction = routeAction$(
  async (formData, requestEvent) => {
    const authUser = await AuthService.getAuthUser(requestEvent);
    if (!authUser) {
      return requestEvent.fail(401, { message: 'No autenticado.' });
    }

    let orgs = requestEvent.sharedMap.get('userOrgs') as
      | Awaited<ReturnType<typeof RBACService.getUserOrganizationsWithRoles>>
      | undefined;

    if (!orgs) {
      orgs = await RBACService.getUserOrganizationsWithRoles(authUser.id);
      requestEvent.sharedMap.set('userOrgs', orgs);
    }

    if (orgs.length === 0) {
      return requestEvent.fail(400, { message: 'No tienes una organización activa.' });
    }

    const activeOrg = resolveActiveOrg(requestEvent, orgs);

    try {
      await SchedulingService.assignOperator({
        appointmentId: formData.appointmentId,
        organizationId: activeOrg.id,
        userId: formData.userId,
        assignedByUserId: authUser.id,
        assignmentMode: formData.assignmentMode,
      });

      return {
        success: true,
        message: 'Operario asignado y cita confirmada correctamente.',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo asignar el operario.';
      return requestEvent.fail(400, { message });
    }
  },
  zod$(
    z.object({
      appointmentId: z.string().uuid(),
      userId: z.string().uuid(),
      assignmentMode: z.enum(['manual', 'ai']).default('manual'),
    }),
  ),
);

export default component$(() => {
  const data = useAppointmentDetailLoader();
  const assignAction = useAssignOperatorAction();
  const appointment = data.value.appointment;

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

  const formatDateTime = (value: Date | string) => {
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
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Detalle de cita</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Gestiona asignación y estado operativo de la reserva.
          </p>
        </div>

        <Link href="/dashboard/appointments" class="text-sm font-medium text-primary-700 hover:text-primary-800">
          ← Volver al listado
        </Link>
      </header>

      {assignAction.value?.message && (
        <Alert variant={assignAction.value.success ? 'success' : 'error'} title="Asignación de operario">
          {assignAction.value.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información de la cita</CardTitle>
        </CardHeader>
        <CardContent>
          <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase text-neutral-500">Cliente</dt>
              <dd class="mt-1 text-sm text-neutral-900">{appointment.clientName}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-neutral-500">Teléfono</dt>
              <dd class="mt-1 text-sm text-neutral-900">{appointment.clientPhone}</dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-neutral-500">Departamento</dt>
              <dd class="mt-1 text-sm">
                <Link
                  href={`/dashboard/departments/${appointment.departmentId}/schedule`}
                  class="font-medium text-neutral-900 hover:text-primary-700"
                >
                  {appointment.departmentName}
                </Link>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-neutral-500">Estado</dt>
              <dd class="mt-1">
                <span class={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium', getStatusClass(appointment.status))}>
                  {getStatusLabel(appointment.status)}
                </span>
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-neutral-500">Inicio</dt>
              <dd class="mt-1 text-sm text-neutral-900">
                {appointment.startAt
                  ? formatDateTime(appointment.startAt)
                  : <span class="text-neutral-400 italic">Callback sin hora fija</span>}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium uppercase text-neutral-500">Fin</dt>
              <dd class="mt-1 text-sm text-neutral-900">
                {appointment.endAt ? formatDateTime(appointment.endAt) : '—'}
              </dd>
            </div>

            {appointment.type === 'callback' && appointment.callbackPreferredAt && (
              <div>
                <dt class="text-xs font-medium uppercase text-neutral-500">Callback preferido</dt>
                <dd class="mt-1 text-sm text-amber-600">
                  ~{formatDateTime(appointment.callbackPreferredAt)}
                </dd>
              </div>
            )}

            <div class="sm:col-span-2">
              <dt class="text-xs font-medium uppercase text-neutral-500">Operario actual</dt>
              <dd class="mt-1 text-sm text-neutral-900">{appointment.operatorName ?? 'Sin asignar'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {appointment.status === 'PENDING' ? (
        <Card>
          <CardHeader>
            <CardTitle>Asignar operario</CardTitle>
          </CardHeader>
          <CardContent>
            {data.value.assignableOperators.length === 0 ? (
              <Alert variant="warning" title="Sin operarios disponibles">
                No hay usuarios activos asignados a este departamento.
              </Alert>
            ) : (
              <Form action={assignAction} class="space-y-4">
                <input type="hidden" name="appointmentId" value={appointment.id} />

                <div>
                  <label class="mb-2 block text-sm font-medium text-neutral-700" for="userId">
                    Operario
                  </label>
                  <select
                    id="userId"
                    name="userId"
                    class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="" disabled selected>
                      Selecciona un operario
                    </option>
                    {data.value.assignableOperators.map((operator) => (
                      <option key={operator.userId} value={operator.userId}>
                        {`${operator.fullName ?? operator.email}${operator.isLead ? ' (Lead)' : ''}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-neutral-700" for="assignmentMode">
                    Modo de asignación
                  </label>
                  <select
                    id="assignmentMode"
                    name="assignmentMode"
                    class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="manual" selected>
                      Manual
                    </option>
                    <option value="ai">IA</option>
                  </select>
                </div>

                <div class="flex justify-end">
                  <Button type="submit" disabled={assignAction.isRunning}>
                    {assignAction.isRunning ? 'Asignando...' : 'Asignar y confirmar cita'}
                  </Button>
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert variant="info" title="Cita no editable desde este flujo">
          Solo las citas en estado Pendiente pueden confirmarse desde esta pantalla.
        </Alert>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Detalle de cita - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Detalle y asignación de operarios para citas del motor de reservas Onucall.',
    },
  ],
};
