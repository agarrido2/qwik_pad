/**
 * Agent Card
 * @description Tarjeta resumida de un agente para vistas de listado.
 */

import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Card, CardContent } from '~/components/ui';
import { cn } from '~/lib/utils/cn';

export interface AgentCardProps {
  id: string;
  name: string;
  assistantName: string;
  sector: string | null;
  isActive: boolean;
  isDefault: boolean;
  phoneNumber: string | null;
}

/**
 * Renderiza una tarjeta con estado operativo y acceso directo a configuración.
 */
export const AgentCard = component$<AgentCardProps>((props) => {
  return (
    <Card class="border-neutral-200 hover:border-primary-300 transition-colors">
      <CardContent class="p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold text-neutral-900">{props.name}</h3>
              {props.isDefault && (
                <span class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  Predeterminado
                </span>
              )}
            </div>
            <p class="text-sm text-neutral-600">Asistente: {props.assistantName}</p>
            <p class="text-sm text-neutral-600">Sector: {props.sector ?? 'Sin sector'}</p>
            <p class="text-sm text-neutral-600">
              Número: {props.phoneNumber ?? 'Sin número asignado'}
            </p>
          </div>

          <span
            class={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              props.isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-neutral-200 text-neutral-600',
            )}
          >
            {props.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div class="mt-4 flex items-center justify-end">
          <Link
            href={`/dashboard/agents/${props.id}`}
            class="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            Configurar →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
