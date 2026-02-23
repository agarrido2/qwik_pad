/**
 * Dashboard Departments - Índice de horarios
 * @description Lista departamentos de la organización para acceder a la gestión de horarios.
 */

import { component$ } from '@builder.io/qwik';
import { Form, Link, routeAction$, routeLoader$, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Input } from '~/components/ui';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { AuthService } from '~/lib/services/auth.service';
import { RBACService } from '~/lib/services/rbac.service';
import { SchedulingService } from '~/lib/services/scheduling.service';
import { cn } from '~/lib/utils/cn';

/**
 * Loader SSR: departamentos de la org activa.
 */
export const useDepartmentsLoader = routeLoader$(async (requestEvent) => {
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
  const departments = await SchedulingService.getDepartmentsByOrg(activeOrg.id);

  return {
    organizationName: activeOrg.name,
    departments,
  };
});

/**
 * Action SSR: crea un nuevo departamento en la organización activa.
 */
export const useCreateDepartmentAction = routeAction$(
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
      await SchedulingService.createDepartment({
        organizationId: activeOrg.id,
        name: formData.name,
        color: formData.color,
        description: formData.description || undefined,
        slotDurationMinutes: formData.slotDurationMinutes,
        bufferBeforeMinutes: formData.bufferBeforeMinutes,
        bufferAfterMinutes: formData.bufferAfterMinutes,
      });

      return { success: true, message: 'Departamento creado correctamente.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el departamento.';
      return requestEvent.fail(400, { message });
    }
  },
  zod$(
    z.object({
      name: z.string().min(2).max(120),
      color: z.string().min(3).max(40),
      description: z.string().max(500).optional().default(''),
      slotDurationMinutes: z.coerce.number().int().min(5).max(240).default(60),
      bufferBeforeMinutes: z.coerce.number().int().min(0).max(120).default(0),
      bufferAfterMinutes: z.coerce.number().int().min(0).max(120).default(0),
    }),
  ),
);

export default component$(() => {
  const data = useDepartmentsLoader();
  const createAction = useCreateDepartmentAction();

  return (
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-neutral-900">Horarios por departamento</h1>
        <p class="mt-1 text-sm text-neutral-600">
          Selecciona un departamento para editar su disponibilidad semanal y excepciones.
        </p>
      </header>

      {createAction.value?.message && (
        <Alert variant={createAction.value.success ? 'success' : 'error'} title="Crear departamento">
          {createAction.value.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nuevo departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form action={createAction} class="grid gap-4 md:grid-cols-2">
            <Input name="name" label="Nombre" required placeholder="Ventas, Soporte, Taller..." />
            <div>
              <label class="mb-2 block text-sm font-medium text-neutral-700" for="color">
                Color
              </label>
              <div class="flex items-center gap-3">
                <input
                  id="color"
                  name="color"
                  type="color"
                  value="#2563eb"
                  class="h-10 w-16 cursor-pointer rounded-md border border-neutral-300 bg-white p-1"
                  required
                />
                <p class="text-sm text-neutral-500">Color visual del departamento en agenda y panel.</p>
              </div>
            </div>
            <Input
              name="slotDurationMinutes"
              label="Duración slot (min)"
              type="number"
              value="60"
              helperText="Bloque base de reserva. Ej: 30 = huecos de 30 min; 60 = huecos de 1 hora."
              required
            />
            <Input
              name="bufferBeforeMinutes"
              label="Buffer antes (min)"
              type="number"
              value="0"
              helperText="Minutos de preparación previos que bloquean agenda antes de la cita."
              required
            />
            <Input
              name="bufferAfterMinutes"
              label="Buffer después (min)"
              type="number"
              value="0"
              helperText="Minutos de margen posterior (cierres, notas, desplazamiento)."
              required
            />

            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-medium text-neutral-700" for="description">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                class="min-h-24 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition-all duration-200 placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                placeholder="Descripción operativa del departamento"
              />
            </div>

            <div class="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={createAction.isRunning}>
                {createAction.isRunning ? 'Creando...' : 'Crear departamento'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      {data.value.departments.length === 0 ? (
        <Alert variant="info" title="Sin departamentos configurados">
          Crea departamentos para comenzar a configurar horarios de disponibilidad.
        </Alert>
      ) : (
        <div class="grid gap-4 md:grid-cols-2">
          {data.value.departments.map((department) => (
            <Card key={department.id}>
              <CardHeader>
                <CardTitle class="flex items-center justify-between">
                  <span>{department.name}</span>
                  <span
                    class={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      department.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700',
                    )}
                  >
                    {department.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent class="space-y-3">
                <dl class="grid grid-cols-1 gap-2 text-sm text-neutral-700">
                  <div class="flex items-center justify-between">
                    <dt>Duración slot</dt>
                    <dd class="font-medium text-neutral-900">{department.slotDurationMinutes} min</dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt>Buffer antes</dt>
                    <dd class="font-medium text-neutral-900">{department.bufferBeforeMinutes} min</dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt>Buffer después</dt>
                    <dd class="font-medium text-neutral-900">{department.bufferAfterMinutes} min</dd>
                  </div>
                </dl>

                <div class="pt-2">
                  <Link href={`/dashboard/departments/${department.id}/schedule`}>
                    <Button class="w-full">Gestionar horario</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Departamentos - Horarios | Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Listado de departamentos para administrar horarios y excepciones del motor de reservas.',
    },
  ],
};
