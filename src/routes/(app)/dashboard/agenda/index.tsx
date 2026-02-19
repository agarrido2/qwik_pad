/**
 * Ruta Agenda - Orquestador de la vista calendario del dashboard.
 *
 * Esta ruta únicamente coordina carga de datos y render de la feature.
 * No contiene lógica de negocio reutilizable.
 */

import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { CalendarView, type CalendarEvent } from '~/features/calendar';

/**
 * Loader SSR para eventos de agenda.
 * V1 usa datos mock tipados para desacoplar la UI de la persistencia.
 */
export const useCalendarEvents = routeLoader$<CalendarEvent[]>(async () => {
  const today = new Date();
  const isoDate = today.toISOString().split('T')[0] ?? '';

  return [
    {
      id: 'evt-1',
      title: 'Cita · Juan Pérez',
      start: `${isoDate}T10:00:00`,
      end: `${isoDate}T11:00:00`,
      color: 'hsl(var(--primary))',
      textColor: 'hsl(var(--primary-foreground))',
      extendedProps: {
        type: 'appointment',
        contactName: 'Juan Pérez',
        status: 'confirmed',
      },
    },
    {
      id: 'evt-2',
      title: 'Seguimiento · María López',
      start: `${isoDate}T13:30:00`,
      end: `${isoDate}T14:00:00`,
      color: 'hsl(var(--warning))',
      textColor: 'hsl(var(--warning-foreground))',
      extendedProps: {
        type: 'follow-up',
        contactName: 'María López',
        status: 'pending',
      },
    },
    {
      id: 'evt-3',
      title: 'Bloqueo · Formación interna',
      start: `${isoDate}T16:00:00`,
      end: `${isoDate}T17:30:00`,
      color: 'hsl(var(--muted))',
      textColor: 'hsl(var(--muted-foreground))',
      extendedProps: {
        type: 'blocked',
      },
    },
  ];
});

/**
 * Página agenda del dashboard.
 */
export default component$(() => {
  const events = useCalendarEvents();

  return (
    <div class="space-y-4">
      <header>
        <h2 class="text-2xl font-bold text-foreground">Agenda</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Visualiza citas, seguimientos y bloqueos operativos de tu agente IA.
        </p>
      </header>

      <CalendarView events={events.value} />
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Agenda - Onucall',
  meta: [
    {
      name: 'description',
      content:
        'Calendario de agenda para gestionar citas y eventos operativos del dashboard de Onucall.',
    },
    {
      property: 'og:title',
      content: 'Agenda - Onucall',
    },
    {
      property: 'og:description',
      content:
        'Calendario de agenda para gestionar citas y eventos operativos del dashboard de Onucall.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://onucall.com/dashboard/agenda',
    },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
  ],
  links: [
    {
      rel: 'canonical',
      href: 'https://onucall.com/dashboard/agenda',
    },
  ],
};
