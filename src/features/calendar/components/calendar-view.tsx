/**
 * Calendar View - Wrapper Qwik para FullCalendar v6 (Vanilla JS).
 *
 * FullCalendar requiere acceso directo al DOM, por eso usamos `useVisibleTask$`.
 * Esta excepción está permitida por estándar al integrar librerías cliente-only.
 */

import {
  component$,
  noSerialize,
  useSignal,
  useVisibleTask$,
  type NoSerialize,
} from '@builder.io/qwik';
import { Calendar, type EventInput } from '@fullcalendar/core';
import { CALENDAR_CONFIG } from '../config/calendar.config';
import type { CalendarEvent } from '../types/calendar.types';

interface CalendarViewProps {
  events: CalendarEvent[];
}

/**
 * Renderiza FullCalendar y destruye la instancia al desmontar para evitar fugas.
 */
export const CalendarView = component$<CalendarViewProps>(({ events }) => {
  const containerRef = useSignal<HTMLDivElement>();
  const calendarRef = useSignal<NoSerialize<Calendar>>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!containerRef.value || calendarRef.value) {
      return;
    }

    const calendar = new Calendar(containerRef.value, {
      ...CALENDAR_CONFIG,
      events: events as EventInput[],
    });

    calendar.render();
    calendarRef.value = noSerialize(calendar);

    cleanup(() => {
      calendar.destroy();
      calendarRef.value = undefined;
    });
  });

  return (
    <section
      aria-label="Agenda de citas y eventos"
      class="rounded-lg border border-border bg-card p-4"
    >
      <div ref={containerRef} class="min-h-[640px]" />
    </section>
  );
});
