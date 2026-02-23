/**
 * Scheduling Engine — Zod Schemas
 *
 * Valida los campos JSONB antes de cualquier INSERT/UPDATE en:
 *   - calendar_schedules.weekly_hours
 *   - calendar_exceptions.custom_hours
 *
 * Usar SIEMPRE en la capa de servicio antes de llamar a la DB.
 * Nunca llegar a la DB con datos sin validar.
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVOS COMPARTIDOS
// ============================================================================

/** Hora en formato HH:MM (24h). Ej: "09:00", "17:30" */
const TimeHHMM = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Formato requerido: HH:MM (ej: "09:00")')
  .refine((t) => {
    const [h, m] = t.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }, 'Hora fuera de rango (00:00 – 23:59)');

/**
 * Un periodo horario con inicio y fin.
 * El fin debe ser posterior al inicio.
 * Ej: { start: "09:00", end: "14:00" }
 */
export const TimePeriodSchema = z
  .object({
    start: TimeHHMM,
    end: TimeHHMM,
  })
  .refine(
    ({ start, end }) => start < end,
    { message: 'end debe ser posterior a start', path: ['end'] }
  );

export type TimePeriod = z.infer<typeof TimePeriodSchema>;

/** Array de periodos para un día. Puede estar vacío (día cerrado). */
export const DayPeriodsSchema = z.array(TimePeriodSchema);

export type DayPeriods = z.infer<typeof DayPeriodsSchema>;

// ============================================================================
// weekly_hours (calendar_schedules)
// ============================================================================

/**
 * Patrón semanal ISODOW (1=Lunes … 7=Domingo).
 *
 * Formato:
 * {
 *   "1": [{ "start": "09:00", "end": "14:00" }, { "start": "17:00", "end": "20:00" }],
 *   "6": [],
 *   "7": []
 * }
 *
 * Reglas:
 * - Las claves deben ser "1" a "7" (ISODOW de PostgreSQL).
 * - Claves ausentes = día cerrado (equivalente a []).
 * - No se requieren las 7 claves; solo las que tengan horario.
 */
export const WeeklyHoursSchema = z
  .record(
    z.enum(['1', '2', '3', '4', '5', '6', '7'], {
      errorMap: () => ({ message: 'Clave ISODOW inválida. Usa "1" (Lunes) … "7" (Domingo)' }),
    }),
    DayPeriodsSchema
  )
  .refine(
    (wh) => Object.keys(wh).length > 0,
    'weekly_hours no puede ser un objeto vacío. Omite los días cerrados en lugar de incluirlos vacíos.'
  );

export type WeeklyHours = z.infer<typeof WeeklyHoursSchema>;

// ============================================================================
// custom_hours (calendar_exceptions)
// ============================================================================

/**
 * Horario especial para un día concreto (excepción).
 * NULL = sin override (se usa weekly_hours).
 * [] = día cerrado.
 * [{start, end}, ...] = horario personalizado ese día.
 */
export const CustomHoursSchema = z.array(TimePeriodSchema).nullable();

export type CustomHours = z.infer<typeof CustomHoursSchema>;

// ============================================================================
// SCHEMAS DE ENTRADA PARA INSERCIÓN
// ============================================================================

/** Payload para crear/actualizar un calendar_schedule */
export const CalendarScheduleInputSchema = z.object({
  targetType: z.enum(['ORGANIZATION', 'DEPARTMENT', 'USER']),
  targetId: z.string().uuid('targetId debe ser UUID'),
  timezone: z
    .string()
    .min(1)
    .default('Europe/Madrid')
    .refine(
      (tz) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Timezone inválida. Usa nombres IANA (ej: "Europe/Madrid", "Atlantic/Canary")' }
    ),
  weeklyHours: WeeklyHoursSchema,
});

export type CalendarScheduleInput = z.infer<typeof CalendarScheduleInputSchema>;

/** Payload para crear/actualizar una calendar_exception */
export const CalendarExceptionInputSchema = z
  .object({
    targetType: z.enum(['ORGANIZATION', 'DEPARTMENT', 'USER']),
    targetId: z.string().uuid('targetId debe ser UUID'),
    exceptionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato requerido: YYYY-MM-DD'),
    isClosed: z.boolean().default(true),
    customHours: CustomHoursSchema.optional(),
    description: z.string().max(500).optional(),
  })
  .refine(
    ({ isClosed, customHours }) => !(isClosed && customHours && customHours.length > 0),
    {
      message: 'Si isClosed=true, customHours debe ser null o []',
      path: ['customHours'],
    }
  );

export type CalendarExceptionInput = z.infer<typeof CalendarExceptionInputSchema>;

/** Payload para llamar al RPC book_appointment */
export const BookAppointmentInputSchema = z.object({
  organizationId: z.string().uuid(),
  departmentId: z.string().uuid(),
  clientName: z.string().min(2, 'Nombre demasiado corto').max(200),
  clientPhone: z
    .string()
    .min(6, 'Teléfono demasiado corto')
    .max(30)
    .regex(/^[+\d\s\-().]+$/, 'Formato de teléfono inválido'),
  startAt: z.string().datetime({ offset: true, message: 'startAt debe ser ISO 8601 con timezone' }),
  userId: z.string().uuid().nullable().default(null),
  assignmentMode: z
    .enum(['manual', 'ai'])
    .or(z.enum(['MANUAL', 'AI']).transform((value) => value.toLowerCase() as 'manual' | 'ai'))
    .nullable()
    .default(null),
});

export type BookAppointmentInput = z.infer<typeof BookAppointmentInputSchema>;

/** Payload para llamar al RPC get_time_window_availability */
export const AvailabilityQuerySchema = z
  .object({
    organizationId: z.string().uuid(),
    departmentId: z.string().uuid(),
    userId: z.string().uuid().nullable().default(null),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato requerido: YYYY-MM-DD'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato requerido: YYYY-MM-DD'),
    clientTimezone: z
      .string()
      .default('Europe/Madrid')
      .refine(
        (tz) => {
          try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            return true;
          } catch {
            return false;
          }
        },
        { message: 'Timezone inválida' }
      ),
  })
  .refine(
    ({ startDate, endDate }) => {
      const diff =
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    },
    { message: 'El rango debe ser entre 0 y 30 días', path: ['endDate'] }
  );

export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;

// ============================================================================
// TIPOS DE RESPUESTA DE LOS RPCs (para tipado en servicios)
// ============================================================================

/** Respuesta de get_time_window_availability */
export type AvailabilityResult = Record<string, string[]>;
// Ej: { "2026-03-03": ["09:00", "09:30"], "2026-03-04": [] }

/** Respuesta de book_appointment — éxito */
export const BookAppointmentSuccessSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  department_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  client_name: z.string(),
  client_phone: z.string(),
  start_at: z.string(),
  end_at: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED']),
  assignment_mode: z.enum(['manual', 'ai']).nullable(),
});

/** Respuesta de book_appointment — error */
export const BookAppointmentErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
});

export type BookAppointmentSuccess = z.infer<typeof BookAppointmentSuccessSchema>;
export type BookAppointmentError = z.infer<typeof BookAppointmentErrorSchema>;

/** Type guard para discriminar éxito/error de book_appointment */
export function isBookingError(
  result: BookAppointmentSuccess | BookAppointmentError
): result is BookAppointmentError {
  return 'error' in result;
}
