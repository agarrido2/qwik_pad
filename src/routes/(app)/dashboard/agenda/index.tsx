/**
 * Ruta Agenda - Orquestador de la vista calendario del dashboard.
 *
 * Esta ruta únicamente coordina carga de datos y render de la feature.
 * No contiene lógica de negocio reutilizable.
 */

import { $, component$, useComputed$, useSignal } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import {
  CalendarSidebar,
  CalendarView,
  type CalendarEvent,
  type Department,
  type UpcomingEvent,
} from '~/features/calendar';

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
        departmentId: 'dept-sales',
        departmentName: 'Ventas',
        priority: 'high',
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
        departmentId: 'dept-support',
        departmentName: 'Soporte',
        priority: 'normal',
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
        departmentId: 'dept-operations',
        departmentName: 'Operaciones',
        priority: 'normal',
      },
    },
    {
      id: 'evt-4',
      title: 'Demo producto · Lead B2B',
      start: `${isoDate}T12:00:00`,
      end: `${isoDate}T13:00:00`,
      color: 'hsl(var(--secondary))',
      textColor: 'hsl(var(--secondary-foreground))',
      extendedProps: {
        type: 'call',
        contactName: 'Marta Gómez',
        status: 'confirmed',
        departmentId: 'dept-sales',
        departmentName: 'Ventas',
        priority: 'normal',
      },
    },
  ];
});

/**
 * Loader SSR para departamentos de agenda.
 * V2 usa catálogo mock tipado; V3 se conectará al service + DB.
 */
export const useDepartments = routeLoader$<Department[]>(async () => {
  return [
    {
      id: 'dept-sales',
      name: 'Ventas',
      color: 'primary',
      slug: 'ventas',
      isActive: true,
    },
    {
      id: 'dept-support',
      name: 'Soporte',
      color: 'warning',
      slug: 'soporte',
      isActive: true,
    },
    {
      id: 'dept-operations',
      name: 'Operaciones',
      color: 'success',
      slug: 'operaciones',
      isActive: true,
    },
    {
      id: 'dept-product',
      name: 'Producto',
      color: 'secondary',
      slug: 'producto',
      isActive: true,
    },
  ];
});

/**
 * Página agenda del dashboard.
 */
export default component$(() => {
  const events = useCalendarEvents();
  const departments = useDepartments();

  const selectedDate = useSignal(new Date().toISOString().split('T')[0] ?? '');
  const activeDepartmentIds = useSignal(departments.value.map((department) => department.id));
  const isMobileOptionsOpen = useSignal(false);

  const filteredEvents = useComputed$(() => {
    return events.value.filter((event) => {
      const departmentId = event.extendedProps?.departmentId;

      // Evento sin departamento explícito permanece visible para no ocultar datos.
      if (!departmentId) {
        return true;
      }

      return activeDepartmentIds.value.includes(departmentId);
    });
  });

  const upcomingEvents = useComputed$<UpcomingEvent[]>(() => {
    const now = Date.now();
    const departmentMap = new Map(
      departments.value.map((department) => [department.id, department])
    );

    return filteredEvents.value
      .filter((event) => new Date(event.start).getTime() >= now)
      .sort((eventA, eventB) => eventA.start.localeCompare(eventB.start))
      .slice(0, 5)
      .map((event) => {
        const departmentId = event.extendedProps?.departmentId;
        const department = departmentId ? departmentMap.get(departmentId) : undefined;

        return {
          id: event.id,
          title: event.title,
          start: event.start,
          departmentColor: department?.color ?? 'primary',
          departmentName: department?.name ?? 'General',
          priority: event.extendedProps?.priority ?? 'normal',
        };
      });
  });

  const handleDateSelect$ = $((isoDate: string) => {
    selectedDate.value = isoDate;
  });

  const handleDepartmentToggle$ = $((departmentId: string) => {
    if (activeDepartmentIds.value.includes(departmentId)) {
      activeDepartmentIds.value = activeDepartmentIds.value.filter(
        (currentId) => currentId !== departmentId
      );
      return;
    }

    activeDepartmentIds.value = [...activeDepartmentIds.value, departmentId];
  });

  const handleDepartmentToggleAll$ = $(() => {
    const allDepartmentIds = departments.value.map((department) => department.id);
    const isEverythingActive = allDepartmentIds.every((departmentId) =>
      activeDepartmentIds.value.includes(departmentId)
    );

    activeDepartmentIds.value = isEverythingActive ? [] : allDepartmentIds;
  });

  const toggleMobileOptions$ = $(() => {
    isMobileOptionsOpen.value = !isMobileOptionsOpen.value;
  });

  return (
    <div class="space-y-3 sm:space-y-4">
      <header class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-foreground">Agenda</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Visualiza citas, seguimientos y bloqueos operativos de tu agente IA.
          </p>
        </div>

        <div class="flex w-full items-center gap-2 lg:w-auto">
          <button
            type="button"
            aria-label="Crear nuevo evento"
            class="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-light lg:w-auto lg:flex-none"
          >
            + Crear Evento
          </button>

          <button
            type="button"
            onClick$={toggleMobileOptions$}
            aria-label="Mostrar opciones de agenda"
            aria-expanded={isMobileOptionsOpen.value}
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {isMobileOptionsOpen.value && (
        <CalendarSidebar
          class="flex flex-col gap-3 lg:hidden"
          selectedDate={selectedDate}
          onDateSelect$={handleDateSelect$}
          departments={departments.value}
          allEvents={events.value}
          activeDepartmentIds={activeDepartmentIds}
          onDepartmentToggle$={handleDepartmentToggle$}
          onDepartmentToggleAll$={handleDepartmentToggleAll$}
          upcomingEvents={upcomingEvents.value}
        />
      )}

      <div class="flex gap-4 lg:gap-6">
        <CalendarSidebar
          class="hidden w-[280px] flex-shrink-0 flex-col gap-4 lg:flex"
          selectedDate={selectedDate}
          onDateSelect$={handleDateSelect$}
          departments={departments.value}
          allEvents={events.value}
          activeDepartmentIds={activeDepartmentIds}
          onDepartmentToggle$={handleDepartmentToggle$}
          onDepartmentToggleAll$={handleDepartmentToggleAll$}
          upcomingEvents={upcomingEvents.value}
        />

        <div class="min-w-0 flex-1">
          <CalendarView events={filteredEvents.value} selectedDate={selectedDate.value} />
        </div>
      </div>
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
