/**
 * Dashboard Agents New - Creación de agente
 * @description Formulario de alta para nuevo agente de voz.
 */

import { component$ } from '@builder.io/qwik';
import { Form, Link, routeAction$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { AgentForm } from '~/components/agents';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle } from '~/components/ui';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { CreateVoiceAgentSchema } from '~/lib/schemas/voice-agent.schemas';
import { AuthService } from '~/lib/services/auth.service';
import { RBACService } from '~/lib/services/rbac.service';
import { VoiceAgentService } from '~/lib/services/voice-agent.service';

/**
 * Action SSR: crea agente para la organización activa del usuario autenticado.
 */
export const useCreateAgentAction = routeAction$(
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

    const created = await VoiceAgentService.create({
      organizationId: activeOrg.id,
      createdBy: authUser.id,
      name: formData.name,
      assistantName: formData.assistantName,
      assistantGender: formData.assistantGender,
      sector: formData.sector,
      friendlinessLevel: formData.friendlinessLevel,
      warmthLevel: formData.warmthLevel,
      isDefault: formData.isDefault,
    });

    throw requestEvent.redirect(302, `/dashboard/agents/${created.id}`);
  },
  zod$(CreateVoiceAgentSchema),
);

export default component$(() => {
  const action = useCreateAgentAction();

  return (
    <div class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Nuevo agente</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Configura la identidad base de tu nuevo agente de voz.
          </p>
        </div>
        <Link href="/dashboard/agents" class="text-sm font-medium text-primary-700 hover:text-primary-800">
          ← Volver al listado
        </Link>
      </header>

      {action.value?.message && (
        <Alert variant="error" title="No se pudo crear el agente">
          {action.value.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos básicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Form action={action} class="space-y-6">
            <AgentForm
              values={{
                name: '',
                assistantName: '',
                assistantGender: 'female',
                sector: '',
                friendlinessLevel: 3,
                warmthLevel: 3,
                isDefault: false,
              }}
            />

            <div class="flex justify-end gap-3">
              <Link href="/dashboard/agents">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={action.isRunning}>
                {action.isRunning ? 'Creando...' : 'Crear agente'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nuevo agente - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Crea un nuevo agente de voz IA para tu organización en Onucall.',
    },
  ],
};
