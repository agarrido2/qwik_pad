/**
 * Agent Builder - Editor visual de agente de voz
 * @description Layout de 3 columnas: prompt (read-only) + config accordions + test voice.
 * El usuario personaliza welcome message, configura funciones y publica a Retell AI.
 *
 * Arquitectura:
 * - routeLoader$ carga agente + master prompt base (1 query JOIN)
 * - routeAction$ para guardar cambios y eliminar
 * - useSignal para estado local del builder (tabs, accordions)
 */

import { component$, useSignal, useTask$, isServer } from '@builder.io/qwik';
import { Form, Link, routeAction$, routeLoader$, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { resolveActiveOrg } from '~/lib/auth/active-org';
import { BuilderSaveSchema, DeleteVoiceAgentSchema } from '~/lib/schemas/voice-agent.schemas';
import { AuthService } from '~/lib/services/auth.service';
import { RBACService } from '~/lib/services/rbac.service';
import { VoiceAgentService } from '~/lib/services/voice-agent.service';
import {
  resolveIcon,
  IconX,
  IconSave,
  IconMic,
  IconMessageSquare,
  IconChevronDown,
  IconZap,
  IconUserCircle,
  IconSettings,
  IconDatabase,
  IconShieldCheck,
  IconGlobe,
  IconWebhook,
  IconLock,
} from '~/components/icons/agent-icons';

// -- Status config --

const STATUS_LABEL: Record<string, { label: string; class: string }> = {
  draft: { label: 'Borrador Activo', class: 'text-blue-600' },
  published: { label: 'Publicado', class: 'text-green-600' },
  paused: { label: 'Pausado', class: 'text-amber-600' },
};

// -- Loader SSR --

/**
 * Carga el agente con datos del master prompt base.
 * 1 query con LEFT JOIN a master_prompts y phone_numbers.
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

  return { agent };
});

// -- Actions SSR --

/**
 * Guarda cambios del builder (welcome message, nombre, etc.).
 */
export const useSaveBuilderAction = routeAction$(
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
      return requestEvent.fail(400, { message: 'Sin organización activa.' });
    }

    const activeOrg = resolveActiveOrg(requestEvent, orgs);

    const updated = await VoiceAgentService.update(requestEvent.params.id, activeOrg.id, {
      welcomeMessage: formData.welcomeMessage || null,
      name: formData.name,
    });

    if (!updated) {
      return requestEvent.fail(404, { message: 'Agente no encontrado.' });
    }

    return { success: true, message: 'Cambios guardados.' };
  },
  zod$(BuilderSaveSchema),
);

/**
 * Elimina el agente y redirige a la galería.
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
      return requestEvent.fail(400, { message: 'Sin organización activa.' });
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

// -- Builder UI --

export default component$(() => {
  const data = useAgentDetailLoader();
  const saveAction = useSaveBuilderAction();
  const deleteAction = useDeleteAgentAction();

  const agent = data.value.agent;
  const statusInfo = STATUS_LABEL[agent.status] ?? STATUS_LABEL.draft;

  // Estado local del builder — useSignal para reactividad atómica
  const activeTab = useSignal<'test' | 'debug'>('test');
  const isWelcomeExpanded = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const cancelDeleteBtnRef = useSignal<HTMLButtonElement>();
  const confirmDeleteBtnRef = useSignal<HTMLButtonElement>();

  // Bloquea el scroll del body mientras el modal está abierto.
  useTask$(({ track, cleanup }) => {
    const isOpen = track(() => isDeleteModalOpen.value);
    if (isServer) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isOpen ? 'hidden' : previousOverflow || '';

    cleanup(() => {
      document.body.style.overflow = previousOverflow;
    });
  });

  // Autofocus al botón de cancelar cuando se abre el modal.
  useTask$(({ track }) => {
    const isOpen = track(() => isDeleteModalOpen.value);
    if (isServer || !isOpen) return;
    cancelDeleteBtnRef.value?.focus();
  });

  // El icono del master prompt (o fallback)
  const SectorIcon = resolveIcon(agent.masterPromptIcon);

  // Prompt a mostrar: preferir el del agente, fallback al del master prompt
  const displayPrompt = agent.promptSystem ?? agent.masterPromptSystemPrompt ?? '';
  const displayWelcome = agent.welcomeMessage ?? agent.masterPromptWelcomeDefault ?? '';

  // Accordion config items
  const configItems = [
    { icon: IconDatabase, label: 'Functions', color: 'text-blue-600' },
    { icon: IconShieldCheck, label: 'Knowledge Base', color: 'text-purple-600' },
    { icon: IconMic, label: 'Speech Settings', color: 'text-orange-600' },
    { icon: IconGlobe, label: 'Call Settings', color: 'text-slate-700' },
    { icon: IconWebhook, label: 'Webhook', color: 'text-green-600' },
    { icon: IconLock, label: 'Security', color: 'text-red-500' },
  ];

  return (
    <div class="h-screen flex flex-col bg-white overflow-hidden font-sans text-slate-900">
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <header class="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 bg-white shrink-0 z-10">
        <div class="flex items-center gap-4">
          {/* Icono + nombre editable */}
          <div class="flex items-center gap-3 px-1">
            <div class="p-2 rounded-lg bg-blue-50 text-blue-600">
              <SectorIcon size={18} />
            </div>
            <h2 class="text-sm font-bold text-slate-800 leading-tight">{agent.name}</h2>
          </div>
          <div class="h-6 w-[1px] bg-slate-200 mx-1" />
          <span class={`text-[10px] font-bold uppercase tracking-tighter ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        </div>

        <div class="flex items-center gap-4">
          {/* ID badge */}
          <div class="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span class="text-[10px] font-mono text-slate-500 uppercase tracking-tighter font-bold truncate max-w-[140px]">
              ID: {agent.id.slice(0, 8)}
            </span>
          </div>
          {/* Eliminar */}
          <button
            type="button"
            onClick$={() => {
              isDeleteModalOpen.value = true;
            }}
            class="p-2 text-red-400 hover:text-red-600 transition-colors border border-slate-100 rounded-lg hover:bg-red-50"
            title="Eliminar agente"
            aria-label="Eliminar agente"
          >
            <IconX size={18} />
          </button>
          {/* Cerrar → volver a galería */}
          <Link
            href="/dashboard/agents"
            class="p-2 text-slate-400 hover:text-slate-900 transition-colors border border-slate-100 rounded-lg hover:bg-slate-50"
            title="Volver a la galería"
          >
            <IconX size={20} />
          </Link>
        </div>
      </header>

      {isDeleteModalOpen.value && (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-agent-title"
          aria-describedby="delete-agent-description"
          onClick$={(ev) => {
            if (ev.target === ev.currentTarget) {
              isDeleteModalOpen.value = false;
            }
          }}
          onKeyDown$={(ev) => {
            if (ev.key === 'Escape') {
              isDeleteModalOpen.value = false;
              return;
            }

            if (ev.key === 'Tab') {
              const cancelBtn = cancelDeleteBtnRef.value;
              const confirmBtn = confirmDeleteBtnRef.value;
              if (!cancelBtn || !confirmBtn) return;

              const activeEl = document.activeElement;

              // Shift+Tab en el primer control → saltar al último
              if (ev.shiftKey && activeEl === cancelBtn) {
                ev.preventDefault();
                confirmBtn.focus();
              }

              // Tab en el último control → saltar al primero
              if (!ev.shiftKey && activeEl === confirmBtn) {
                ev.preventDefault();
                cancelBtn.focus();
              }
            }
          }}
        >
          <div
            class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick$={(ev) => ev.stopPropagation()}
          >
            <h3 id="delete-agent-title" class="text-lg font-bold text-slate-900">
              Eliminar agente
            </h3>
            <p id="delete-agent-description" class="mt-2 text-sm text-slate-600">
              Esta acción eliminará el agente y no se puede deshacer. ¿Quieres continuar?
            </p>

            <div class="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick$={() => {
                  isDeleteModalOpen.value = false;
                }}
                ref={cancelDeleteBtnRef}
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>

              <Form action={deleteAction}>
                <input type="hidden" name="id" value={agent.id} />
                <button
                  type="submit"
                  ref={confirmDeleteBtnRef}
                  class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Eliminar
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TOOLBAR (col-span-3) ═══════════════════════ */}
      <div class="grid grid-cols-1 lg:grid-cols-4 shrink-0">
        <div class="lg:col-span-3 bg-slate-50 p-3 md:p-4 flex items-center justify-between border-b border-slate-200">
          {/* Control pills */}
          <div class="flex items-center gap-3 overflow-x-auto pr-4">
            {/* Modelo / Voz */}
            <div class="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm h-10 overflow-hidden shrink-0">
              <button
                type="button"
                class="flex items-center gap-2 px-3 hover:bg-slate-50 border-r border-slate-100 h-full transition-colors text-slate-700"
                aria-label="Selector de voz del asistente"
              >
                <IconUserCircle size={18} class="text-green-600" />
                <span class="text-sm font-medium whitespace-nowrap">{agent.assistantName}</span>
                <IconChevronDown size={14} class="text-slate-400" />
              </button>
              <button type="button" class="px-3 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors h-full" aria-label="Ajustes de voz">
                <IconSettings size={14} />
              </button>
            </div>
            {/* Idioma */}
            <div class="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm h-10 overflow-hidden shrink-0">
              <button
                type="button"
                class="flex items-center gap-2 px-3 hover:bg-slate-50 h-full transition-colors text-slate-700"
                aria-label="Selector de idioma"
              >
                <span class="text-sm">🇪🇸</span>
                <span class="text-sm font-medium whitespace-nowrap">Spanish</span>
              </button>
            </div>
          </div>

          {/* Publish button */}
          <Form action={saveAction}>
            <input type="hidden" name="name" value={agent.name} />
            <input type="hidden" name="welcomeMessage" value={displayWelcome} />
            <button
              type="submit"
              disabled={saveAction.isRunning}
              class={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shrink-0 ${
                saveAction.isRunning
                  ? 'bg-slate-100 text-slate-400 shadow-none'
                  : 'bg-slate-900 text-white hover:bg-black hover:shadow-lg'
              }`}
            >
              {saveAction.isRunning ? 'Guardando...' : <><IconSave size={16} /> Guardar</>}
            </button>
          </Form>
        </div>
        {/* Espacio columna 4 del toolbar */}
        <div class="hidden lg:block bg-slate-50 border-b border-slate-200" />
      </div>

      {/* Feedback de acciones */}
      {saveAction.value?.message && (
        <div class={`px-6 py-2 text-sm font-medium ${saveAction.value.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveAction.value.message}
        </div>
      )}

      {/* ═══════════════════════ CUERPO 3 COLUMNAS ═══════════════════════ */}
      <main class="grid grid-cols-1 lg:grid-cols-4 flex-1 overflow-hidden">
        {/* ── COL 1-2: System Prompt (read-only) + Welcome Message ── */}
        <section class="lg:col-span-2 lg:border-r border-slate-200 flex flex-col bg-slate-50 overflow-hidden">
          <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
            {/* System Prompt (read-only) */}
            <div class="space-y-3 flex-1 flex flex-col min-h-0">
              <div class="flex justify-between items-end shrink-0">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  System Prompt Master
                </label>
                {agent.masterPromptId && (
                  <div class="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                    {agent.masterPromptName ?? 'Master Prompt'}
                  </div>
                )}
              </div>
              <div class="flex-1 bg-white rounded-2xl p-4 md:p-6 font-mono text-[12px] leading-relaxed text-slate-600 border border-slate-200 shadow-inner overflow-y-auto">
                <span class="text-slate-300 italic block mb-4 border-b border-slate-50 pb-2">
                  // Configuración Nativa - Solo Lectura
                </span>
                <pre class="whitespace-pre-wrap font-sans text-slate-700 text-sm">
                  {displayPrompt || 'Sin prompt configurado.'}
                </pre>
                {/* Contexto dinámico preview */}
                {displayWelcome && (
                  <div class="mt-8 pt-6 border-t border-slate-100 space-y-3">
                    <div class="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                      <IconZap size={12} /> Contexto Dinámico
                    </div>
                    <div class="bg-blue-50/50 rounded-lg p-3 text-slate-500 border border-blue-100/50">
                      <span class="font-bold text-slate-700 italic text-[11px]">Welcome message:</span>
                      <span class="ml-1 italic text-[11px]">"{displayWelcome}"</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Message Accordion (editable) */}
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 overflow-hidden">
              <button
                type="button"
                onClick$={() => (isWelcomeExpanded.value = !isWelcomeExpanded.value)}
                class="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                aria-expanded={isWelcomeExpanded.value}
                aria-controls="welcome-message-panel"
              >
                <div class="flex items-center gap-2">
                  <IconMessageSquare size={16} class="text-blue-600" />
                  <span class="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Mensaje de Bienvenida
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  {!isWelcomeExpanded.value && displayWelcome && (
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-100 text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">
                      {displayWelcome.slice(0, 40)}...
                    </span>
                  )}
                  <IconChevronDown
                    size={16}
                    class={`text-slate-400 transition-transform ${isWelcomeExpanded.value ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>
              {isWelcomeExpanded.value && (
                <div id="welcome-message-panel" class="px-4 pb-4">
                  <Form action={saveAction}>
                    <input type="hidden" name="name" value={agent.name} />
                    <textarea
                      name="welcomeMessage"
                      class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm h-32 resize-none outline-none transition-all text-slate-700 leading-relaxed focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
                      placeholder="Escribe el saludo inicial..."
                    >
                      {displayWelcome}
                    </textarea>
                    <div class="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={saveAction.isRunning}
                        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                      >
                        <IconSave size={14} />
                        {saveAction.isRunning ? 'Guardando...' : 'Guardar mensaje'}
                      </button>
                    </div>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── COL 3: Config Accordions ── */}
        <section class="hidden lg:flex lg:col-span-1 lg:border-r border-slate-200 flex-col overflow-y-auto bg-white p-6">
          <div class="space-y-3">
            {configItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                class="w-full border border-slate-200 rounded-2xl overflow-hidden shadow-sm group hover:border-slate-300"
                aria-label={`Abrir configuración ${item.label}`}
              >
                <div class="p-4 bg-white flex justify-between items-center hover:bg-slate-50/50 transition-all">
                  <div class="flex items-center gap-4">
                    <item.icon size={18} class="text-slate-400 group-hover:text-slate-700 transition-colors" />
                    <span class="text-sm font-bold text-slate-700">{item.label}</span>
                  </div>
                  <IconChevronDown size={18} class="text-slate-300 group-hover:text-slate-500" />
                </div>
              </button>
            ))}
          </div>

          {/* Datos del agente */}
          <div class="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Info del agente</h4>
            <div class="space-y-2 text-xs text-slate-500">
              <div class="flex justify-between">
                <span>Sector</span>
                <span class="font-mono font-bold text-slate-700">{agent.sector ?? '—'}</span>
              </div>
              <div class="flex justify-between">
                <span>Género</span>
                <span class="font-mono font-bold text-slate-700">{agent.assistantGender === 'female' ? 'Femenino' : 'Masculino'}</span>
              </div>
              <div class="flex justify-between">
                <span>Teléfono</span>
                <span class="font-mono font-bold text-slate-700">{agent.phoneNumber ?? 'Sin asignar'}</span>
              </div>
              <div class="flex justify-between">
                <span>Retell ID</span>
                <span class="font-mono font-bold text-slate-700 truncate max-w-[120px]">{agent.retellAgentId ?? '—'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── COL 4: Test Voice / Logs ── */}
        <section class="hidden lg:flex lg:col-span-1 flex-col bg-slate-50 overflow-hidden">
          {/* Tabs */}
          <div class="flex p-1.5 bg-slate-200/50 mx-6 mt-6 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick$={() => (activeTab.value = 'test')}
              class={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab.value === 'test'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Test Voice
            </button>
            <button
              type="button"
              onClick$={() => (activeTab.value = 'debug')}
              class={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab.value === 'debug'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Logs
            </button>
          </div>

          {/* Tab content */}
          <div class="flex-1 flex flex-col p-6 md:p-8 overflow-hidden relative border-t border-slate-200 mt-6">
            {activeTab.value === 'test' ? (
              <div class="flex-1 flex flex-col items-center justify-center text-center space-y-12 pb-12">
                <div class="relative group">
                  <div class="absolute -inset-10 bg-blue-500/10 rounded-full animate-ping opacity-0 group-hover:opacity-100" />
                  <div class="relative bg-white h-32 w-32 rounded-full shadow-2xl flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                    <IconMic size={40} class="text-blue-600" />
                  </div>
                </div>
                <div class="space-y-4">
                  <h4 class="text-xl font-bold tracking-tight">Probador de IA</h4>
                  <p class="text-[11px] text-slate-400 max-w-xs mx-auto italic font-medium">
                    Valida el comportamiento de {agent.name}.
                  </p>
                </div>
                <button
                  type="button"
                  class="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all uppercase text-[10px] tracking-widest"
                >
                  Simular Llamada
                </button>
              </div>
            ) : (
              <div class="flex-1 bg-slate-900 rounded-[2rem] p-6 font-mono text-[10px] overflow-y-auto space-y-4 border border-slate-800 text-slate-400">
                <div class="flex items-center gap-2 text-slate-500 uppercase font-bold tracking-[0.3em] text-[8px] mb-4 border-b border-slate-800 pb-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live Stream
                </div>
                <div class="flex gap-4 opacity-50">
                  <span class="text-slate-600">--:--:--</span>
                  <span class="text-blue-500">[SYS]</span>
                  <span>Esperando conexión con Retell AI...</span>
                </div>
                <div class="flex gap-4 animate-pulse">
                  <span class="text-slate-600">--:--:--</span>
                  <span class="text-slate-500">_</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const data = resolveValue(useAgentDetailLoader);

  return {
    title: `Builder · ${data.agent.name} - Dashboard Onucall`,
    meta: [
      {
        name: 'description',
        content: `Configura y personaliza el agente ${data.agent.name} antes de publicarlo.`,
      },
    ],
  };
};
