/**
 * Recent Calls Table - Tabla de actividad reciente de llamadas
 * 
 * Muestra las últimas llamadas con detalles:
 * - Fecha/hora
 * - Número origen
 * - Duración
 * - Motivo (badge con color)
 * - Estado (Resuelto/Escalado)
 * - Acción (ver detalles)
 * 
 * Responsive: Desktop = tabla, Mobile = card list
 * Pattern: Componente presentacional, recibe datos vía props
 */

import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { cn } from '~/lib/utils/cn';

export interface CallRecord {
  id: string;
  timestamp: string;
  phoneNumber: string;
  duration: string;
  reason: 'sales' | 'support' | 'info' | 'complaint';
  resolved: boolean;
}

export interface RecentCallsTableProps {
  /** Llamadas a mostrar */
  calls: CallRecord[];
  /** Mostrar mensaje cuando no hay datos */
  emptyMessage?: string;
}

/**
 * Helper: Mapea motivo a badge con color
 */
const getReasonBadge = (reason: CallRecord['reason']) => {
  const badges = {
    sales: { label: 'Ventas', color: 'bg-blue-100 text-blue-700' },
    support: { label: 'Soporte', color: 'bg-purple-100 text-purple-700' },
    info: { label: 'Información', color: 'bg-neutral-100 text-neutral-700' },
    complaint: { label: 'Queja', color: 'bg-red-100 text-red-700' },
  };
  return badges[reason];
};

export const RecentCallsTable = component$<RecentCallsTableProps>(
  ({ calls, emptyMessage = 'No hay llamadas registradas aún.' }) => {
    // Si no hay datos, mostrar mensaje vacío
    if (calls.length === 0) {
      return (
        <div class="py-12 text-center">
          <svg
            class="mx-auto h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <p class="mt-4 text-sm text-neutral-500">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <>
        {/* Desktop View: Table */}
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-neutral-200 text-left">
                <th class="px-4 py-3 font-medium text-neutral-500">
                  Número
                </th>
                <th class="px-4 py-3 font-medium text-neutral-500">
                  Duración
                </th>
                <th class="px-4 py-3 font-medium text-neutral-500">Motivo</th>
                <th class="px-4 py-3 font-medium text-neutral-500">Estado</th>
                <th class="px-4 py-3 font-medium text-neutral-500">Hora</th>
                <th class="px-4 py-3 font-medium text-neutral-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                const reasonBadge = getReasonBadge(call.reason);
                return (
                  <tr key={call.id} class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-neutral-900">
                      {call.phoneNumber}
                    </td>
                    <td class="px-4 py-3 text-neutral-600">
                      {call.duration}
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          reasonBadge.color
                        )}
                      >
                        {reasonBadge.label}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          call.resolved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        )}
                      >
                        {call.resolved ? 'Resuelta' : 'Escalada'}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-neutral-500">{call.timestamp}</td>
                    <td class="px-4 py-3">
                      <Link
                        href={`/dashboard/llamadas/${call.id}`}
                        class="text-primary-600 hover:text-primary-700 font-medium text-xs"
                      >
                        Ver detalles →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Card List */}
        <div class="md:hidden space-y-3">
          {calls.map((call) => {
            const reasonBadge = getReasonBadge(call.reason);
            return (
              <div
                key={call.id}
                class="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header: Número + Estado */}
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <p class="font-medium text-neutral-900">
                      {call.phoneNumber}
                    </p>
                    <p class="text-xs text-neutral-500 mt-1">
                      {call.timestamp}
                    </p>
                  </div>
                  <span
                    class={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      call.resolved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    {call.resolved ? 'Resuelta' : 'Escalada'}
                  </span>
                </div>

                {/* Body: Duración + Motivo */}
                <div class="flex items-center gap-4 mb-3 text-sm">
                  <div class="flex items-center gap-1 text-neutral-600">
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{call.duration}</span>
                  </div>
                  <span
                    class={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      reasonBadge.color
                    )}
                  >
                    {reasonBadge.label}
                  </span>
                </div>

                {/* Footer: Acción */}
                <Link
                  href={`/dashboard/llamadas/${call.id}`}
                  class="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-1"
                >
                  Ver detalles
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>
      </>
    );
  }
);
