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
  selectedDate?: string;
}

const isBetweenMobileSummaryRange = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth >= 421 && window.innerWidth <= 768;
};

const paintMobileEventSummaries = (calendar: Calendar): void => {
  const rootElement = calendar.el;

  rootElement
    .querySelectorAll<HTMLElement>('.fc-day-event-summary')
    .forEach((summaryElement) => summaryElement.remove());

  if (!isBetweenMobileSummaryRange()) {
    return;
  }

  const eventsByDate = calendar.getEvents().reduce<Record<string, number>>(
    (accumulator, event) => {
      if (!event.start) {
        return accumulator;
      }

      const dateKey = event.start.toISOString().split('T')[0] ?? '';
      accumulator[dateKey] = (accumulator[dateKey] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  rootElement
    .querySelectorAll<HTMLElement>('.fc-daygrid-day[data-date]')
    .forEach((dayCell) => {
      const dateKey = dayCell.getAttribute('data-date') ?? '';
      const eventCount = eventsByDate[dateKey] ?? 0;

      if (eventCount <= 0) {
        return;
      }

      const frame = dayCell.querySelector<HTMLElement>('.fc-daygrid-day-frame');
      if (!frame) {
        return;
      }

      const summary = document.createElement('span');
      summary.className = 'fc-day-event-summary';
      summary.setAttribute('aria-label', `${eventCount} eventos`);

      const dot = document.createElement('span');
      dot.className = 'fc-day-event-summary-dot';
      dot.setAttribute('aria-hidden', 'true');

      const count = document.createElement('span');
      count.className = 'fc-day-event-summary-count';
      count.textContent = String(eventCount);

      summary.append(dot, count);
      frame.appendChild(summary);
    });
};

/**
 * Renderiza FullCalendar y destruye la instancia al desmontar para evitar fugas.
 */
export const CalendarView = component$<CalendarViewProps>((props) => {
  const containerRef = useSignal<HTMLDivElement>();
  const calendarRef = useSignal<NoSerialize<Calendar>>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!containerRef.value || calendarRef.value) {
      return;
    }

    const calendar = new Calendar(containerRef.value, {
      ...CALENDAR_CONFIG,
      events: props.events as EventInput[],
    });

    calendar.render();
    calendarRef.value = noSerialize(calendar);

    cleanup(() => {
      calendar.destroy();
      calendarRef.value = undefined;
    });
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const events = track(() => props.events);
    const selectedDate = track(() => props.selectedDate);

    const calendar = calendarRef.value;
    if (!calendar) {
      return;
    }

    calendar.removeAllEvents();
    calendar.addEventSource(events as EventInput[]);

    paintMobileEventSummaries(calendar);

    if (selectedDate) {
      calendar.gotoDate(selectedDate);
    }
  });

  return (
    <section
      aria-label="Agenda de citas y eventos"
      class="rounded-lg border border-border bg-card p-2 sm:p-4"
    >
      <div ref={containerRef} class="min-h-[520px] sm:min-h-[640px]" />
    </section>
  );
});
