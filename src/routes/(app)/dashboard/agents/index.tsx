/**
 * Agents Gallery - Galería de agentes de voz
 * @description Tarjetas de agentes con badges de estado (draft/published/paused).
 * El usuario ve sus agentes y puede crear uno nuevo (→ selector master prompt).
 *
 * Arquitectura: la ruta solo ORQUESTA. La lógica de negocio vive en VoiceAgentService.
 */

import { component$ } from '@builder.io/qwik';
import { Link, routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { RBACService } from '~/lib/services/rbac.service';
import { AuthService } from '~/lib/services/auth.service';
import { VoiceAgentService } from '~/lib/services/voice-agent.service';
import type { VoiceAgentListItem } from '~/lib/services/voice-agent.service';
import { IconPlus, IconBot, resolveIcon } from '~/components/icons/agent-icons';

// -- Status badge config --

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  published: { label: 'Publicado', bg: 'bg-green-100', text: 'text-green-700' },
  draft: { label: 'Borrador', bg: 'bg-slate-100', text: 'text-slate-500' },
  paused: { label: 'Pausado', bg: 'bg-amber-100', text: 'text-amber-700' },
};

/**
 * Loader SSR: obtiene agentes de la organización activa usando sharedMap cacheado.
 * 1 query JOIN (voiceAgents + phoneNumbers) = buen rendimiento.
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

// -- Componente tarjeta de agente (inline, no merece archivo separado aún) --

interface AgentGalleryCardProps {
  agent: VoiceAgentListItem;
}

/**
 * Tarjeta individual de agente en la galería.
 * Muestra icono de sector, badge de status, nombre y botón editar.
 */
const AgentGalleryCard = component$<AgentGalleryCardProps>(({ agent }) => {
  const badge = STATUS_BADGE[agent.status] ?? STATUS_BADGE.draft;
  const SectorIcon = resolveIcon(null); // TODO: mapear desde master prompt icon cuando tengamos ese dato
  // Decidimos el color del icono según status para feedback visual rápido
  const iconBg = agent.status === 'published' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500';

  return (
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div class="flex justify-between items-start mb-4">
        <div class={`p-3 rounded-xl ${iconBg}`}>
          <SectorIcon size={24} />
        </div>
        <span class={`${badge.bg} ${badge.text} text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider`}>
          {badge.label}
        </span>
      </div>

      <h3 class="text-lg font-bold text-slate-900">{agent.name}</h3>
      <p class="text-slate-400 text-xs mt-1 mb-1 font-mono">{agent.assistantName}</p>

      {agent.phoneNumber && (
        <p class="text-slate-400 text-xs font-mono mb-4">{agent.phoneNumber}</p>
      )}
      {!agent.phoneNumber && <div class="mb-4" />}

      <Link
        href={`/dashboard/agents/${agent.id}`}
        class="block w-full py-2.5 text-center bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-600 rounded-xl font-bold transition-all text-sm border border-slate-100"
      >
        Editar Agente
      </Link>
    </div>
  );
});

// -- Página principal --

export default component$(() => {
  const data = useAgentsLoader();

  return (
    <div class="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-900">
      <div class="max-w-6xl mx-auto">
        {/* Header */}
        <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-10">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight">Mis Agentes</h1>
            <p class="text-slate-500 mt-1 text-sm font-medium">
              Panel de gestión Onucall · {data.value.organizationName}
            </p>
          </div>
          <Link
            href="/dashboard/agents/new"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100 self-start sm:self-auto"
          >
            <IconPlus size={20} /> Crear nuevo agente
          </Link>
        </header>

        {/* Empty state */}
        {data.value.agents.length === 0 ? (
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <div class="bg-slate-100 p-6 rounded-2xl mb-6">
              <IconBot size={48} class="text-slate-400" />
            </div>
            <h2 class="text-xl font-bold text-slate-700 mb-2">Sin agentes configurados</h2>
            <p class="text-slate-500 text-sm max-w-md">
              Crea tu primer agente de voz para empezar a operar llamadas de forma autónoma.
            </p>
            <Link
              href="/dashboard/agents/new"
              class="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
            >
              Crear primer agente
            </Link>
          </div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.value.agents.map((agent) => (
              <AgentGalleryCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Mis Agentes - Dashboard Onucall',
  meta: [
    {
      name: 'description',
      content: 'Gestiona agentes de voz de tu organización en Onucall.',
    },
  ],
};
