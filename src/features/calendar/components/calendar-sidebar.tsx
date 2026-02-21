/**
 * Calendar Sidebar - Composición del panel lateral de Agenda.
 *
 * Agrupa DatePicker, filtro de departamentos y próximos eventos manteniendo
 * la ruta como orquestador único de estado y derivaciones.
 */

import { component$, type QRL, type Signal } from '@builder.io/qwik';
import { DatePickerCalendar } from './date-picker-calendar';
import { DepartmentFilter } from './department-filter';
import { UpcomingEvents } from './upcoming-events';
import type { CalendarEvent, Department, UpcomingEvent } from '../types/calendar.types';

interface CalendarSidebarProps {
  selectedDate: Signal<string>;
  onDateSelect$: QRL<(dateIso: string) => void>;
  departments: Department[];
  allEvents: CalendarEvent[];
  activeDepartmentIds: Signal<string[]>;
  onDepartmentToggle$: QRL<(departmentId: string) => void>;
  onDepartmentToggleAll$: QRL<() => void>;
  upcomingEvents: UpcomingEvent[];
  class?: string;
}

/**
 * Sidebar lateral desktop de Agenda V2.
 */
export const CalendarSidebar = component$<CalendarSidebarProps>((props) => {
  return (
    <aside
      class={props.class ?? 'hidden w-[280px] flex-shrink-0 flex-col gap-4 lg:flex'}
      aria-label="Panel lateral de agenda"
    >
      <DatePickerCalendar
        selectedDate={props.selectedDate}
        onDateSelect$={props.onDateSelect$}
      />

      <DepartmentFilter
        departments={props.departments}
        events={props.allEvents}
        activeDepartmentIds={props.activeDepartmentIds}
        onToggle$={props.onDepartmentToggle$}
        onToggleAll$={props.onDepartmentToggleAll$}
      />

      <UpcomingEvents events={props.upcomingEvents} />
    </aside>
  );
});
