/**
 * Agents New - Selector de Master Prompts
 * @description El usuario elige un master prompt curado por Onucall.
 * Al hacer clic se crea un borrador (voice_agent con status 'draft')
 * y se redirige al builder para personalizar antes de publicar.
 *
 * Flujo: GET (load master prompts por sector) → POST (create draft) → redirect → builder
 */

import { component$ } from '@builder.io/qwik';
import { Form, Link, routeAction$, routeLoader$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { CreateDraftSchema } from '~/lib/schemas/voice-agent.schemas';
import { AuthService } from '~/lib/services/auth.service';
import { MasterPromptService } from '~/lib/services/master-prompt.service';
import { RBACService } from '~/lib/services/rbac.service';
import { VoiceAgentService } from '~/lib/services/voice-agent.service';
import { IconArrowLeft, resolveIcon } from '~/components/icons/agent-icons';

/**
 * Loader SSR: lista master prompts activos filtrados por el sector de la organización.
 * 1 query simple con filtro por sector + isActive.
 */
export const useMasterPromptsLoader = routeLoader$(async (requestEvent) => {
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
  // Filtramos por sector de la organización activa
  const sector = activeOrg.sector ?? 'concesionario';
  const prompts = await MasterPromptService.getBySector(sector);

  return {
    prompts,
    sector,
    organizationName: activeOrg.name,
  };
});

/**
 * Action SSR: crea borrador de agente a partir del master prompt seleccionado.
 * Valida con Zod, copia systemPrompt + welcomeMessage del master prompt,
 * y redirige al builder del nuevo agente.
 */
export const useCreateDraftAction = routeAction$(
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
    let agentId: string;

    try {
      const agent = await VoiceAgentService.createDraft({
        organizationId: activeOrg.id,
        createdBy: authUser.id,
        masterPromptId: formData.masterPromptId,
        name: formData.name,
        sector: activeOrg.sector ?? 'concesionario',
      });
      agentId = agent.id;
    } catch (err) {
      return requestEvent.fail(500, {
        message: err instanceof Error ? err.message : 'Error al crear el borrador.',
      });
    }

    throw requestEvent.redirect(302, `/dashboard/agents/${agentId}`);
  },
  zod$(CreateDraftSchema),
);

export default component$(() => {
  const data = useMasterPromptsLoader();
  const createDraft = useCreateDraftAction();

  return (
    <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-8 text-slate-900 font-sans">
      <h2 class="text-3xl font-extrabold tracking-tight mb-2">Selecciona un Master Prompt</h2>
      <p class="text-slate-500 text-sm mb-10 font-medium">
        Elige la plantilla base para tu nuevo agente · {data.value.organizationName}
      </p>

      {/* Error feedback */}
      {createDraft.value?.message && (
        <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium max-w-md w-full text-center">
          {createDraft.value.message}
        </div>
      )}

      {data.value.prompts.length === 0 ? (
        <div class="text-center py-16">
          <p class="text-slate-400 text-sm">
            No hay master prompts disponibles para el sector «{data.value.sector}».
          </p>
          <p class="text-slate-400 text-xs mt-2">
            Contacta al equipo de Onucall para configurar plantillas.
          </p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
          {data.value.prompts.map((mp) => {
            const PromptIcon = resolveIcon(mp.icon);
            // Color dinámico según icono/sector
            const colorClass = mp.icon === 'truck'
              ? 'bg-red-50 text-red-500'
              : 'bg-blue-50 text-blue-600';

            return (
              <Form action={createDraft} key={mp.id}>
                {/* Campos ocultos para el action */}
                <input type="hidden" name="masterPromptId" value={mp.id} />
                <input type="hidden" name="name" value={mp.name} />

                <button
                  type="submit"
                  disabled={createDraft.isRunning}
                  class="w-full bg-white p-8 rounded-3xl border-2 border-transparent hover:border-blue-600 transition-all text-left shadow-sm hover:shadow-xl group h-full flex flex-col disabled:opacity-50 disabled:cursor-wait"
                >
                  <div class={`mb-6 p-4 rounded-2xl inline-flex w-fit ${colorClass}`}>
                    <PromptIcon size={32} />
                  </div>
                  <h3 class="font-bold text-xl mb-2">{mp.name}</h3>
                  <p class="text-slate-500 text-sm flex-1 leading-relaxed">
                    {mp.description ?? 'Plantilla de agente de voz curada por Onucall.'}
                  </p>
                  <div class="mt-8 pt-4 border-t border-slate-50 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    Sector: {mp.sector}
                  </div>
                </button>
              </Form>
            );
          })}
        </div>
      )}

      <Link
        href="/dashboard/agents"
        class="mt-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold uppercase text-[10px] tracking-[0.2em] transition-all"
      >
        <IconArrowLeft size={16} /> Volver a la galería
      </Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nuevo agente - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Selecciona un master prompt para crear un nuevo agente de voz IA.',
    },
  ],
};
