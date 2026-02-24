/**
 * Dashboard Agent Detail - Edición avanzada
 * @description Configuración detallada de un agente (prompts, transferencias, número).
 */

import { component$ } from '@builder.io/qwik';
import { Form, Link, routeAction$, routeLoader$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { AgentForm } from '~/components/agents';
import { Alert, Button, Card, CardContent, CardHeader, CardTitle } from '~/components/ui';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { DeleteVoiceAgentSchema, UpdateVoiceAgentSchema } from '~/lib/schemas/voice-agent.schemas';
import { AuthService } from '~/lib/services/auth.service';
import { RBACService } from '~/lib/services/rbac.service';
import { VoiceAgentService } from '~/lib/services/voice-agent.service';

/**
 * Loader SSR: carga agente y pool de números de la organización activa.
 */
export const useAgentDetailLoader = routeLoader$(async (requestEvent) => {
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

  const agent = await VoiceAgentService.getById(requestEvent.params.id, activeOrg.id);
  if (!agent) {
    throw requestEvent.redirect(302, '/dashboard/agents');
  }

  const phoneNumbers = await VoiceAgentService.getPhoneNumbersForOrganization(activeOrg.id);

  return {
    agent,
    phoneNumbers,
  };
});

/**
 * Action SSR: actualiza configuración avanzada de agente.
 */
export const useUpdateAgentAction = routeAction$(
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

    const updated = await VoiceAgentService.update(requestEvent.params.id, activeOrg.id, {
      name: formData.name,
      description: formData.description || null,
      assistantName: formData.assistantName,
      assistantGender: formData.assistantGender,
      sector: 'concesionario',
      friendlinessLevel: formData.friendlinessLevel,
      warmthLevel: formData.warmthLevel,
      businessDescription: formData.businessDescription || null,
      promptSystem: formData.promptSystem || null,
      transferPolicy: formData.transferPolicy || null,
      leadsEmail: formData.leadsEmail || null,
      webhookUrl: formData.webhookUrl || null,
      retellAgentId: formData.retellAgentId || null,
      phoneNumberId: formData.phoneNumberId || null,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
    });

    if (!updated) {
      return requestEvent.fail(404, { message: 'Agente no encontrado.' });
    }

    return { success: true, message: 'Agente actualizado correctamente.' };
  },
  zod$(UpdateVoiceAgentSchema),
);

/**
 * Action SSR: elimina agente de la organización activa.
 */
export const useDeleteAgentAction = routeAction$(
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
    const result = await VoiceAgentService.delete(formData.id, activeOrg.id);

    if (!result.deleted) {
      return requestEvent.fail(404, { message: 'Agente no encontrado.' });
    }

    throw requestEvent.redirect(302, '/dashboard/agents');
  },
  zod$(DeleteVoiceAgentSchema),
);

export default component$(() => {
  const data = useAgentDetailLoader();
  const updateAction = useUpdateAgentAction();
  const deleteAction = useDeleteAgentAction();

  return (
    <div class="space-y-6">
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">{data.value.agent.name}</h1>
          <p class="mt-1 text-sm text-neutral-600">Configuración avanzada del agente</p>
        </div>
        <Link href="/dashboard/agents" class="text-sm font-medium text-primary-700 hover:text-primary-800">
          ← Volver al listado
        </Link>
      </header>

      {updateAction.value?.message && (
        <Alert variant={updateAction.value.success ? 'success' : 'error'} title="Actualizar agente">
          {updateAction.value.message}
        </Alert>
      )}

      {deleteAction.value?.message && (
        <Alert variant="error" title="Eliminar agente">
          {deleteAction.value.message}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <Form action={updateAction} class="space-y-6">
            <AgentForm
              showAdvanced
              currentAgentId={data.value.agent.id}
              phoneOptions={data.value.phoneNumbers}
              values={{
                name: data.value.agent.name,
                assistantName: data.value.agent.assistantName,
                assistantGender: data.value.agent.assistantGender,
                friendlinessLevel: data.value.agent.friendlinessLevel,
                warmthLevel: data.value.agent.warmthLevel,
                isDefault: data.value.agent.isDefault,
                description: data.value.agent.description ?? '',
                businessDescription: data.value.agent.businessDescription ?? '',
                promptSystem: data.value.agent.promptSystem ?? '',
                transferPolicy: data.value.agent.transferPolicy ?? '',
                leadsEmail: data.value.agent.leadsEmail ?? '',
                webhookUrl: data.value.agent.webhookUrl ?? '',
                retellAgentId: data.value.agent.retellAgentId ?? '',
                isActive: data.value.agent.isActive,
                phoneNumberId: data.value.agent.phoneNumberId ?? '',
              }}
            />

            <div class="flex justify-end">
              <Button type="submit" disabled={updateAction.isRunning}>
                {updateAction.isRunning ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </Form>

          <div class="mt-4 border-t border-neutral-200 pt-4">
            <Form action={deleteAction}>
              <input type="hidden" name="id" value={data.value.agent.id} />
              <Button type="submit" variant="outline" class="text-red-600 border-red-300 hover:bg-red-50">
                Eliminar agente
              </Button>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Editar agente - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Configura y edita tu agente de voz IA: prompts, políticas y asignación de número telefónico.',
    },
  ],
};
