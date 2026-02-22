/**
 * Dashboard Agents - Listado de agentes de voz
 * @description Página principal de gestión de agentes por organización.
 */

import { component$ } from '@builder.io/qwik';
import { Link, routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { AgentCard } from '~/components/agents';
import { Alert, Button } from '~/components/ui';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { RBACService } from '~/lib/services/rbac.service';
import { AuthService } from '~/lib/services/auth.service';
import { VoiceAgentService } from '~/lib/services/voice-agent.service';

/**
 * Loader SSR: obtiene agentes de la organización activa usando sharedMap cacheado.
 */
export const useAgentsLoader = routeLoader$(async (requestEvent) => {
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
  const agents = await VoiceAgentService.getByOrganization(activeOrg.id);

  return {
    organizationName: activeOrg.name,
    agents,
  };
});

export default component$(() => {
  const data = useAgentsLoader();

  return (
    <div class="space-y-6">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">Agentes de voz</h1>
          <p class="mt-1 text-sm text-neutral-600">
            Gestiona los agentes IA de {data.value.organizationName}.
          </p>
        </div>

        <Link href="/dashboard/agents/new">
          <Button>Crear nuevo agente</Button>
        </Link>
      </header>

      {data.value.agents.length === 0 ? (
        <Alert variant="info" title="Sin agentes configurados">
          Crea tu primer agente para empezar a operar llamadas de forma autónoma.
        </Alert>
      ) : (
        <div class="grid gap-4 lg:grid-cols-2">
          {data.value.agents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              assistantName={agent.assistantName}
              sector={agent.sector}
              isActive={agent.isActive}
              isDefault={agent.isDefault}
              phoneNumber={agent.phoneNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Agentes - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Gestiona agentes de voz de tu organización en Onucall.',
    },
  ],
};
