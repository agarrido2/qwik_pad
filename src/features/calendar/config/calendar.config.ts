/**
 * Calendar Config - Configuración canónica de FullCalendar V1.
 *
 * Se define fuera del componente para mantener separación de responsabilidades:
 * - Este archivo declara opciones de librería (plugins, toolbar, locale)
 * - El componente inyecta datos dinámicos (events) y ciclo de vida
 */

import type { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';

/**
 * Opciones base para Agenda V1.
 * Nota: se deja `editable: false` en V1 para entregar modo lectura estable.
 */
export const CALENDAR_CONFIG: Partial<CalendarOptions> = {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  locale: esLocale,
  initialView: 'dayGridMonth',
  firstDay: 1,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista',
  },
  nowIndicator: true,
  navLinks: true,
  editable: false,
  selectable: false,
  dayMaxEvents: true,
  weekNumbers: false,
  slotMinTime: '08:00:00',
  slotMaxTime: '21:00:00',
  expandRows: true,
  height: 'auto',
};
