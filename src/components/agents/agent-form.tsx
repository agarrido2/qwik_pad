/**
 * Agent Form
 * @description Formulario reutilizable para crear y editar agentes de voz.
 */

import { component$ } from '@builder.io/qwik';
import { FormField } from '~/components/ui';

export interface AgentPhoneOption {
  id: string;
  phoneNumber: string;
  status: 'available' | 'assigned' | 'suspended';
  assignedToAgentId: string | null;
}

export interface AgentFormValues {
  name: string;
  assistantName: string;
  assistantGender: 'male' | 'female';
  friendlinessLevel: number;
  warmthLevel: number;
  isDefault: boolean;
  description?: string;
  businessDescription?: string;
  promptSystem?: string;
  transferPolicy?: string;
  leadsEmail?: string;
  webhookUrl?: string;
  retellAgentId?: string;
  isActive?: boolean;
  phoneNumberId?: string;
}

export interface AgentFormProps {
  values: AgentFormValues;
  showAdvanced?: boolean;
  phoneOptions?: AgentPhoneOption[];
  currentAgentId?: string;
}

/**
 * El formulario es intencionalmente declarativo y sin estado local,
 * así el control de mutación permanece en routeAction$.
 */
export const AgentForm = component$<AgentFormProps>((props) => {
  const phoneOptions = props.phoneOptions ?? [];
  const showAdvanced = props.showAdvanced ?? false;
  const fixedSector = 'concesionario';

  return (
    <div class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          name="name"
          label="Nombre interno"
          value={props.values.name}
          placeholder="Ej: Recepción General"
          required
        />
        <FormField
          name="assistantName"
          label="Nombre del asistente"
          value={props.values.assistantName}
          placeholder="Ej: Laura"
          required
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-1">
          <label for="assistantGender" class="text-sm font-medium text-neutral-700">
            Género de voz
          </label>
          <select
            id="assistantGender"
            name="assistantGender"
            class="w-full rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={props.values.assistantGender}
          >
            <option value="female">Femenina</option>
            <option value="male">Masculina</option>
          </select>
        </div>

        <div class="space-y-1">
          <label for="friendlinessLevel" class="text-sm font-medium text-neutral-700">
            Nivel simpatía (1-5)
          </label>
          <input
            id="friendlinessLevel"
            name="friendlinessLevel"
            type="number"
            min={1}
            max={5}
            value={String(props.values.friendlinessLevel)}
            required
            class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </div>

        <div class="space-y-1">
          <label for="warmthLevel" class="text-sm font-medium text-neutral-700">
            Nivel amabilidad (1-5)
          </label>
          <input
            id="warmthLevel"
            name="warmthLevel"
            type="number"
            min={1}
            max={5}
            value={String(props.values.warmthLevel)}
            required
            class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </div>
      </div>

      <div class="rounded-lg border border-primary-200 bg-primary-50 p-3">
        <p class="text-sm font-medium text-neutral-900">Vertical del agente</p>
        <p class="text-sm text-neutral-700">Concesionario de Vehículos</p>
      </div>

      <input type="hidden" name="sector" value={fixedSector} />

      <div class="flex items-center gap-2">
        <input
          id="isDefault"
          type="checkbox"
          name="isDefault"
          checked={props.values.isDefault}
          class="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
        />
        <label for="isDefault" class="text-sm text-neutral-700">
          Marcar como agente predeterminado de la organización
        </label>
      </div>

      {showAdvanced && (
        <>
          <hr class="my-2 border-neutral-200" />

          <FormField
            name="description"
            label="Descripción interna"
            value={props.values.description ?? ''}
            placeholder="Uso del agente en la operación"
          />

          <div class="space-y-1">
            <label for="businessDescription" class="text-sm font-medium text-neutral-700">
              Contexto de negocio
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              class="min-h-24 w-full rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe el negocio para mejorar respuestas del agente"
              value={props.values.businessDescription ?? ''}
            />
          </div>

          <div class="space-y-1">
            <label for="promptSystem" class="text-sm font-medium text-neutral-700">
              Prompt del sistema
            </label>
            <textarea
              id="promptSystem"
              name="promptSystem"
              class="min-h-32 w-full rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Reglas, tono y límites del agente"
              value={props.values.promptSystem ?? ''}
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <FormField
              name="transferPolicy"
              label="Política de transferencia"
              value={props.values.transferPolicy ?? ''}
              placeholder="Cuándo pasar a humano"
            />
            <FormField
              name="leadsEmail"
              label="Email para leads"
              type="email"
              value={props.values.leadsEmail ?? ''}
              placeholder="leads@tuempresa.com"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <FormField
              name="retellAgentId"
              label="Retell Agent ID"
              value={props.values.retellAgentId ?? ''}
              placeholder="agent_xxx"
            />
            <FormField
              name="webhookUrl"
              label="Webhook URL"
              type="url"
              value={props.values.webhookUrl ?? ''}
              placeholder="https://..."
            />
          </div>

          <div class="space-y-1">
            <label for="phoneNumberId" class="text-sm font-medium text-neutral-700">
              Número de teléfono
            </label>
            <select
              id="phoneNumberId"
              name="phoneNumberId"
              class="w-full rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={props.values.phoneNumberId ?? ''}
            >
              <option value="">Sin asignar</option>
              {phoneOptions.map((phone) => {
                const isCurrentAssignment = phone.assignedToAgentId === props.currentAgentId;
                const isAvailableToPick = phone.status === 'available' || isCurrentAssignment;

                return (
                  <option
                    key={phone.id}
                    value={phone.id}
                    disabled={!isAvailableToPick}
                  >
                    {`${phone.phoneNumber}${isCurrentAssignment ? ' (asignado a este agente)' : ''}`}
                  </option>
                );
              })}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={props.values.isActive ?? true}
              class="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label for="isActive" class="text-sm text-neutral-700">
              Agente activo
            </label>
          </div>
        </>
      )}
    </div>
  );
});
