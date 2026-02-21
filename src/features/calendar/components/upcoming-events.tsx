/**
 * Upcoming Events - Lista compacta de próximos eventos.
 *
 * Componente de presentación pura: recibe eventos ya filtrados y ordenados
 * desde la capa orquestadora de la ruta.
 */

import { component$ } from '@builder.io/qwik';
import type { UpcomingEvent } from '../types/calendar.types';

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const getBorderClass = (color: string): string => {
  switch (color) {
    case 'primary':
      return 'border-l-primary';
    case 'warning':
      return 'border-l-warning';
    case 'success':
      return 'border-l-success';
    case 'secondary':
      return 'border-l-secondary';
    default:
      return 'border-l-muted-foreground';
  }
};

/**
 * Renderiza el bloque lateral de próximos eventos (máximo 5).
 */
export const UpcomingEvents = component$<UpcomingEventsProps>(({ events }) => {
  return (
    <section class="rounded-lg border border-border bg-card p-4" aria-label="Próximos eventos">
      <header class="mb-4">
        <p class="text-sm font-semibold text-foreground">Próximos Eventos</p>
      </header>

      {events.length === 0 ? (
        <p class="text-sm text-muted-foreground">No hay eventos próximos.</p>
      ) : (
        <ul class="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              class={[
                'rounded-md border border-border bg-muted/30 p-3',
                'border-l-4',
                getBorderClass(event.departmentColor),
              ]}
            >
              <div class="flex items-start justify-between gap-2">
                <p class="line-clamp-1 text-sm font-medium text-foreground">{event.title}</p>
                {event.priority === 'high' && (
                  <span
                    class="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-error"
                    aria-label="Evento de alta prioridad"
                  />
                )}
              </div>

              <p class="mt-1 text-xs text-muted-foreground">
                {event.departmentName} · {DATE_TIME_FORMATTER.format(new Date(event.start))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});
