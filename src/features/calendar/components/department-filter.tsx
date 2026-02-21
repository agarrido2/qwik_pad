/**
 * Department Filter - Filtro visual por departamentos.
 *
 * Este componente mantiene la UI de toggles y deriva horas acumuladas por
 * departamento en tiempo real a partir del dataset de eventos actual.
 */

import { $, component$, useComputed$, type QRL, type Signal } from '@builder.io/qwik';
import type { CalendarEvent, Department } from '../types/calendar.types';

interface DepartmentFilterProps {
  departments: Department[];
  events: CalendarEvent[];
  activeDepartmentIds: Signal<string[]>;
  onToggle$: QRL<(departmentId: string) => void>;
  onToggleAll$: QRL<() => void>;
}

const getColorDotClass = (color: string): string => {
  switch (color) {
    case 'primary':
      return 'bg-primary';
    case 'warning':
      return 'bg-warning';
    case 'success':
      return 'bg-success';
    case 'secondary':
      return 'bg-secondary';
    default:
      return 'bg-muted-foreground';
  }
};

const getDurationHours = (start: string, end?: string): number => {
  if (!end) {
    return 0;
  }

  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  const duration = endDate - startDate;

  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return duration / (1000 * 60 * 60);
};

/**
 * Lista de departamentos con toggles y resumen de horas.
 */
export const DepartmentFilter = component$<DepartmentFilterProps>(
  ({ departments, events, activeDepartmentIds, onToggle$, onToggleAll$ }) => {
    const hoursByDepartment = useComputed$(() => {
      return departments.reduce<Record<string, number>>((accumulator, department) => {
        const totalHours = events
          .filter((event) => event.extendedProps?.departmentId === department.id)
          .reduce((sum, event) => sum + getDurationHours(event.start, event.end), 0);

        accumulator[department.id] = totalHours;
        return accumulator;
      }, {});
    });

    const allSelected = useComputed$(() => {
      if (!departments.length) {
        return false;
      }

      return departments.every((department) =>
        activeDepartmentIds.value.includes(department.id)
      );
    });

    const handleToggle$ = $((departmentId: string) => {
      onToggle$(departmentId);
    });

    const handleToggleAll$ = $(() => {
      onToggleAll$();
    });

    return (
      <section class="rounded-lg border border-border bg-card p-4" aria-label="Filtro por departamentos">
        <header class="mb-4 flex items-center justify-between">
          <p class="text-sm font-semibold text-foreground">Departamentos</p>

          <button
            type="button"
            class={[
              'inline-flex h-6 w-11 items-center rounded-full px-1 transition-colors',
              allSelected.value ? 'bg-primary' : 'bg-muted',
            ]}
            onClick$={handleToggleAll$}
            aria-label="Activar o desactivar todos los departamentos"
            aria-pressed={allSelected.value}
          >
            <span
              class={[
                'h-4 w-4 rounded-full bg-background transition-transform',
                allSelected.value ? 'translate-x-5' : 'translate-x-0',
              ]}
            />
          </button>
        </header>

        <ul class="space-y-3">
          {departments.map((department) => {
            const isActive = activeDepartmentIds.value.includes(department.id);
            const totalHours = hoursByDepartment.value[department.id] ?? 0;

            return (
              <li key={department.id} class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-2">
                  <span
                    class={['h-2.5 w-2.5 flex-shrink-0 rounded-full', getColorDotClass(department.color)]}
                    aria-hidden="true"
                  />
                  <span class="truncate text-sm text-foreground">{department.name}</span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">{totalHours.toFixed(1)}h</span>

                  <button
                    type="button"
                    onClick$={() => handleToggle$(department.id)}
                    aria-label={`Filtrar por ${department.name}`}
                    aria-pressed={isActive}
                    class={[
                      'inline-flex h-5 w-9 items-center rounded-full px-1 transition-colors',
                      isActive ? 'bg-primary' : 'bg-muted',
                    ]}
                  >
                    <span
                      class={[
                        'h-3 w-3 rounded-full bg-background transition-transform',
                        isActive ? 'translate-x-4' : 'translate-x-0',
                      ]}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
);
