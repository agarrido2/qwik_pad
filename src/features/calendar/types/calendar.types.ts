/**
 * Calendar Types - Contratos tipados para FullCalendar V1.
 *
 * Este archivo centraliza los tipos compartidos por la feature de Agenda
 * para evitar acoplamiento entre ruta, componente visual y config.
 */

/** Tipo de evento de negocio representado en agenda. */
export type CalendarEventType = 'appointment' | 'call' | 'follow-up' | 'blocked';

/** Estado operativo del evento. */
export type CalendarEventStatus = 'confirmed' | 'pending' | 'cancelled';

/**
 * Payload extendido que viaja en FullCalendar para mostrar metadata
 * sin mezclar reglas de negocio dentro del componente visual.
 */
export interface CalendarEventExtendedProps {
  type: CalendarEventType;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  status?: CalendarEventStatus;
}

/**
 * Evento normalizado para FullCalendar.
 * `start` y `end` usan ISO 8601 para evitar ambigüedades de zona horaria.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  textColor?: string;
  extendedProps?: CalendarEventExtendedProps;
}

/** Vistas habilitadas en Agenda V1. */
export type CalendarViewType =
  | 'dayGridMonth'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek';
