/**
 * Dashboard Department Schedule - Gestión de horarios
 * @description Orquesta edición de weekly_hours y excepciones para un departamento.
 */

import { component$ } from '@builder.io/qwik';
import { Form, Link, routeAction$, routeLoader$, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input } from '~/components/ui';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { AuthService } from '~/lib/services/auth.service';
import { RBACService } from '~/lib/services/rbac.service';
import { SchedulingService } from '~/lib/services/scheduling.service';

/**
 * Loader SSR: departamento, schedule base y excepciones.
 */
export const useDepartmentScheduleLoader = routeLoader$(async (requestEvent) => {
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
  const department = await SchedulingService.getDepartmentById(requestEvent.params.id, activeOrg.id);

  if (!department) {
    throw requestEvent.redirect(302, '/dashboard/appointments');
  }

  const schedule = await SchedulingService.getSchedule('DEPARTMENT', department.id);
  const exceptions = await SchedulingService.listExceptions('DEPARTMENT', department.id);

  return {
    department,
    schedule,
    exceptions,
  };
});

/**
 * Action SSR: guardar/actualizar weekly_hours de departamento.
 */
export const useSaveDepartmentScheduleAction = routeAction$(
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
    const department = await SchedulingService.getDepartmentById(requestEvent.params.id, activeOrg.id);

    if (!department) {
      return requestEvent.fail(404, { message: 'Departamento no encontrado.' });
    }

    try {
      const parsedWeeklyHours: Partial<
        Record<'1' | '2' | '3' | '4' | '5' | '6' | '7', Array<{ start: string; end: string }>>
      > = JSON.parse(formData.weeklyHoursJson) as Partial<
        Record<'1' | '2' | '3' | '4' | '5' | '6' | '7', Array<{ start: string; end: string }>>
      >;

      await SchedulingService.upsertSchedule({
        targetType: 'DEPARTMENT',
        targetId: department.id,
        timezone: formData.timezone,
        weeklyHours: parsedWeeklyHours,
      });

      return { success: true, message: 'Horario semanal guardado correctamente.' };
    } catch (error) {
      const message =
        error instanceof Error
          ? `No se pudo guardar el horario semanal: ${error.message}`
          : 'No se pudo guardar el horario semanal.';

      return requestEvent.fail(400, { message });
    }
  },
  zod$(
    z.object({
      timezone: z.string().min(1),
      weeklyHoursJson: z.string().min(2),
    }),
  ),
);

/**
 * Action SSR: crear/actualizar excepción puntual del departamento.
 */
export const useUpsertDepartmentExceptionAction = routeAction$(
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
    const department = await SchedulingService.getDepartmentById(requestEvent.params.id, activeOrg.id);

    if (!department) {
      return requestEvent.fail(404, { message: 'Departamento no encontrado.' });
    }

    try {
      const customHours = formData.customHoursJson.trim();
      const parsedCustomHours: Array<{ start: string; end: string }> | null = customHours
        ? (JSON.parse(customHours) as Array<{ start: string; end: string }>)
        : null;

        await SchedulingService.upsertException({
        targetType: 'DEPARTMENT',
        targetId: department.id,
        exceptionDate: formData.exceptionDate,
        isClosed: formData.isClosed,
          customHours: parsedCustomHours,
        description: formData.description || undefined,
      });

      return {
        success: true,
        message: parsedCustomHours
          ? 'Excepción guardada con horario personalizado.'
          : 'Excepción guardada correctamente.',
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? `No se pudo guardar la excepción: ${error.message}`
          : 'No se pudo guardar la excepción.';

      return requestEvent.fail(400, { message });
    }
  },
  zod$(
    z.object({
      exceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      isClosed: z.coerce.boolean(),
      customHoursJson: z.string().optional().default(''),
      description: z.string().max(500).optional().default(''),
    }),
  ),
);

/**
 * Action SSR: eliminar excepción por ID.
 */
export const useDeleteDepartmentExceptionAction = routeAction$(
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
    const department = await SchedulingService.getDepartmentById(requestEvent.params.id, activeOrg.id);

    if (!department) {
      return requestEvent.fail(404, { message: 'Departamento no encontrado.' });
    }

    const removed = await SchedulingService.deleteException(formData.exceptionId, department.id);
    if (!removed) {
      return requestEvent.fail(404, { message: 'La excepción no existe o ya fue eliminada.' });
    }

    return { success: true, message: 'Excepción eliminada correctamente.' };
  },
  zod$(
    z.object({
      exceptionId: z.string().uuid(),
    }),
  ),
);

export default component$(() => {
  const data = useDepartmentScheduleLoader();
  const saveScheduleAction = useSaveDepartmentScheduleAction();
  const upsertExceptionAction = useUpsertDepartmentExceptionAction();
  const deleteExceptionAction = useDeleteDepartmentExceptionAction();

  const prettyWeeklyHours = JSON.stringify(data.value.schedule?.weeklyHours ?? {}, null, 2);

  return (
    <div class="space-y-6">
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Horario · {data.value.department.name}</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Configura disponibilidad semanal y excepciones del departamento.
          </p>
        </div>

        <Link href="/dashboard/appointments" class="text-sm font-medium text-primary-700 hover:text-primary-800">
          ← Volver a citas
        </Link>
      </header>

      {saveScheduleAction.value?.message && (
        <Alert variant={saveScheduleAction.value.success ? 'success' : 'error'} title="Horario semanal">
          {saveScheduleAction.value.message}
        </Alert>
      )}

      {upsertExceptionAction.value?.message && (
        <Alert variant={upsertExceptionAction.value.success ? 'success' : 'error'} title="Excepción">
          {upsertExceptionAction.value.message}
        </Alert>
      )}

      {deleteExceptionAction.value?.message && (
        <Alert variant={deleteExceptionAction.value.success ? 'success' : 'error'} title="Eliminar excepción">
          {deleteExceptionAction.value.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Patrón semanal (weekly_hours)</CardTitle>
        </CardHeader>

        <CardContent>
          <Form action={saveScheduleAction} class="space-y-4">
            <Input
              name="timezone"
              label="Timezone"
              required
              value={data.value.schedule?.timezone ?? 'Europe/Madrid'}
              placeholder="Europe/Madrid"
            />

            <div>
              <label class="mb-2 block text-sm font-medium text-neutral-700" for="weeklyHoursJson">
                JSON weekly_hours
              </label>
              <textarea
                id="weeklyHoursJson"
                name="weeklyHoursJson"
                class="min-h-64 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {prettyWeeklyHours}
              </textarea>
              <p class="mt-2 text-xs text-neutral-500">
                Formato esperado ISODOW: claves "1".."7" con arrays de periodos [{'{'}"start":"09:00","end":"14:00"{'}'}].
              </p>
            </div>

            <div class="flex justify-end">
              <Button type="submit" disabled={saveScheduleAction.isRunning}>
                {saveScheduleAction.isRunning ? 'Guardando...' : 'Guardar horario semanal'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nueva excepción</CardTitle>
        </CardHeader>

        <CardContent>
          <Form action={upsertExceptionAction} class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-neutral-700" for="exceptionDate">
                Fecha
              </label>
              <input
                id="exceptionDate"
                name="exceptionDate"
                type="date"
                required
                class="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition-all duration-200 placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div class="flex items-center gap-2">
              <input id="isClosed" name="isClosed" type="checkbox" value="true" class="h-4 w-4 rounded border-neutral-300" checked />
              <label for="isClosed" class="text-sm text-neutral-700">
                Día cerrado completo
              </label>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-neutral-700" for="customHoursJson">
                custom_hours (JSON opcional)
              </label>
              <textarea
                id="customHoursJson"
                name="customHoursJson"
                class="min-h-28 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder='[{"start":"10:00","end":"13:00"}]'
              />
              <p class="mt-2 text-xs text-neutral-500">
                Si “Día cerrado completo” está activo, deja este campo vacío.
              </p>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-neutral-700" for="description">
                Descripción
              </label>
              <input
                id="description"
                name="description"
                placeholder="Festivo local, inventario, baja, etc."
                class="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition-all duration-200 placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div class="flex justify-end">
              <Button type="submit" disabled={upsertExceptionAction.isRunning}>
                {upsertExceptionAction.isRunning ? 'Guardando...' : 'Guardar excepción'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excepciones existentes ({data.value.exceptions.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {data.value.exceptions.length === 0 ? (
            <Alert variant="info" title="Sin excepciones">
              Este departamento no tiene excepciones registradas.
            </Alert>
          ) : (
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-neutral-200">
                    <th class="py-3 px-4 text-left text-sm font-medium text-neutral-700">Fecha</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-neutral-700">Estado</th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-neutral-700">Descripción</th>
                    <th class="py-3 px-4 text-right text-sm font-medium text-neutral-700">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {data.value.exceptions.map((exception) => (
                    <tr key={exception.id} class="border-b border-neutral-100">
                      <td class="py-3 px-4 text-sm text-neutral-900">{exception.exceptionDate}</td>
                      <td class="py-3 px-4 text-sm text-neutral-700">
                        {exception.isClosed ? 'Cerrado' : 'Horario personalizado'}
                      </td>
                      <td class="py-3 px-4 text-sm text-neutral-700">{exception.description ?? '—'}</td>
                      <td class="py-3 px-4 text-right">
                        <Form action={deleteExceptionAction} class="inline">
                          <input type="hidden" name="exceptionId" value={exception.id} />
                          <Button type="submit" size="sm" variant="outline" class="text-red-600 border-red-300 hover:bg-red-50">
                            Eliminar
                          </Button>
                        </Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Horario de departamento - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Gestión de horarios semanales y excepciones de disponibilidad por departamento.',
    },
  ],
};
