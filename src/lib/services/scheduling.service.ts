/**
 * Scheduling Service
 *
 * Capa de negocio del Scheduling Engine:
 * - Encapsula acceso a RPCs (`get_time_window_availability`, `book_appointment`)
 * - Centraliza queries del panel admin de citas
 * - Valida payloads con Zod antes de tocar DB
 *
 * Regla arquitectónica: las rutas (`src/routes`) solo orquestan; toda la lógica vive aquí.
 */

import type { RequestEventAction, RequestEventLoader } from '@builder.io/qwik-city';
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '../db/client';
import {
  appointments,
  calendarExceptions,
  calendarSchedules,
  departmentMembers,
  departments,
  organizationMembers,
  users,
} from '../db/schema';
import {
  AvailabilityQuerySchema,
  type AvailabilityQuery,
  type AvailabilityResult,
  BookAppointmentErrorSchema,
  type BookAppointmentError,
  BookAppointmentInputSchema,
  type BookAppointmentInput,
  BookAppointmentSuccessSchema,
  type BookAppointmentSuccess,
  CalendarExceptionInputSchema,
  type CalendarExceptionInput,
  CalendarScheduleInputSchema,
  type CalendarScheduleInput,
} from '../schemas/scheduling.schemas';
import { createServerSupabaseClient } from '../supabase/client.server';

/** Type helper para cualquier tipo de RequestEvent SSR */
type AnyRequestEvent =
  | RequestEventAction
  | RequestEventLoader
  | Parameters<import('@builder.io/qwik-city').RequestHandler>[0];

export interface AppointmentListItem {
  id: string;
  organizationId: string;
  departmentId: string;
  departmentName: string;
  userId: string | null;
  operatorName: string | null;
  contactId: string | null;
  clientName: string;
  clientPhone: string;
  notes: string | null;
  type: 'appointment' | 'callback' | 'visit';
  // Nullable: callbacks sin hora fija tienen startAt/endAt = null
  startAt: Date | null;
  endAt: Date | null;
  // Para callbacks: fecha aproximada objetivo (no bloquea agenda)
  callbackPreferredAt: Date | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  assignmentMode: 'manual' | 'ai' | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignOperatorInput {
  appointmentId: string;
  organizationId: string;
  userId: string;
  assignedByUserId: string;
  assignmentMode?: 'manual' | 'ai';
}

export interface DepartmentAssignableMember {
  userId: string;
  fullName: string | null;
  email: string;
  isLead: boolean;
}

export interface ListAppointmentsFilters {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  departmentId?: string;
  from?: Date;
  to?: Date;
}

export interface SchedulingDepartmentSummary {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  isActive: boolean;
  slotDurationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}

export interface CreateDepartmentInput {
  organizationId: string;
  name: string;
  color: string;
  description?: string;
  slotDurationMinutes?: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
}

export class SchedulingService {
  /**
   * Crea un departamento en la organización activa.
   *
   * Genera slug automáticamente y garantiza unicidad por organización.
   */
  static async createDepartment(input: CreateDepartmentInput) {
    const baseSlug = input.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'departamento';

    return db.transaction(async (tx) => {
      const existingSlugs = await tx
        .select({ slug: departments.slug })
        .from(departments)
        .where(eq(departments.organizationId, input.organizationId));

      const used = new Set(existingSlugs.map((item) => item.slug));
      let slug = baseSlug;
      let counter = 2;

      while (used.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
      }

      const [department] = await tx
        .insert(departments)
        .values({
          organizationId: input.organizationId,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          color: input.color,
          slug,
          isActive: true,
          slotDurationMinutes: input.slotDurationMinutes ?? 60,
          bufferBeforeMinutes: input.bufferBeforeMinutes ?? 0,
          bufferAfterMinutes: input.bufferAfterMinutes ?? 0,
        })
        .returning();

      return department;
    });
  }

  /**
   * Lista departamentos de una organización para gestión de horarios.
   */
  static async getDepartmentsByOrg(organizationId: string): Promise<SchedulingDepartmentSummary[]> {
    return db
      .select({
        id: departments.id,
        organizationId: departments.organizationId,
        name: departments.name,
        slug: departments.slug,
        isActive: departments.isActive,
        slotDurationMinutes: departments.slotDurationMinutes,
        bufferBeforeMinutes: departments.bufferBeforeMinutes,
        bufferAfterMinutes: departments.bufferAfterMinutes,
      })
      .from(departments)
      .where(eq(departments.organizationId, organizationId))
      .orderBy(asc(departments.sortOrder), asc(departments.name));
  }

  /**
   * Obtiene un departamento validando pertenencia a organización.
   */
  static async getDepartmentById(
    departmentId: string,
    organizationId: string,
  ): Promise<SchedulingDepartmentSummary | null> {
    const [department] = await db
      .select({
        id: departments.id,
        organizationId: departments.organizationId,
        name: departments.name,
        slug: departments.slug,
        isActive: departments.isActive,
        slotDurationMinutes: departments.slotDurationMinutes,
        bufferBeforeMinutes: departments.bufferBeforeMinutes,
        bufferAfterMinutes: departments.bufferAfterMinutes,
      })
      .from(departments)
      .where(and(eq(departments.id, departmentId), eq(departments.organizationId, organizationId)))
      .limit(1);

    return department ?? null;
  }

  /**
   * Lista citas de una organización para el panel admin.
   *
   * Optimización: único SELECT con JOIN a departamentos + operario asignado.
   */
  static async getAppointmentsByOrg(
    organizationId: string,
    filters?: ListAppointmentsFilters,
  ): Promise<AppointmentListItem[]> {
    const whereClauses = [eq(appointments.organizationId, organizationId)];

    if (filters?.status) {
      whereClauses.push(eq(appointments.status, filters.status));
    }

    if (filters?.departmentId) {
      whereClauses.push(eq(appointments.departmentId, filters.departmentId));
    }

    if (filters?.from) {
      whereClauses.push(gte(appointments.startAt, filters.from));
    }

    if (filters?.to) {
      whereClauses.push(lte(appointments.startAt, filters.to));
    }

    const rows = await db
      .select({
        id: appointments.id,
        organizationId: appointments.organizationId,
        departmentId: appointments.departmentId,
        departmentName: departments.name,
        userId: appointments.userId,
        operatorName: users.fullName,
        contactId: appointments.contactId,
        clientName: appointments.clientName,
        clientPhone: appointments.clientPhone,
        notes: appointments.notes,
        type: appointments.type,
        startAt: appointments.startAt,
        endAt: appointments.endAt,
        callbackPreferredAt: appointments.callbackPreferredAt,
        status: appointments.status,
        assignmentMode: appointments.assignmentMode,
        cancellationReason: appointments.cancellationReason,
        cancelledAt: appointments.cancelledAt,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
      })
      .from(appointments)
      .innerJoin(departments, eq(appointments.departmentId, departments.id))
      .leftJoin(users, eq(appointments.userId, users.id))
      .where(and(...whereClauses))
      .orderBy(desc(appointments.startAt));

    return rows.map((row) => ({
      ...row,
      status: row.status as AppointmentListItem['status'],
      assignmentMode: row.assignmentMode as AppointmentListItem['assignmentMode'],
      type: row.type as AppointmentListItem['type'],
      operatorName: row.operatorName ?? null,
    }));
  }

  /**
   * Obtiene una cita concreta validando pertenencia a la organización activa.
   */
  static async getAppointmentById(
    appointmentId: string,
    organizationId: string,
  ): Promise<AppointmentListItem | null> {
    const [row] = await db
      .select({
        id: appointments.id,
        organizationId: appointments.organizationId,
        departmentId: appointments.departmentId,
        departmentName: departments.name,
        userId: appointments.userId,
        operatorName: users.fullName,
        contactId: appointments.contactId,
        clientName: appointments.clientName,
        clientPhone: appointments.clientPhone,
        notes: appointments.notes,
        type: appointments.type,
        startAt: appointments.startAt,
        endAt: appointments.endAt,
        callbackPreferredAt: appointments.callbackPreferredAt,
        status: appointments.status,
        assignmentMode: appointments.assignmentMode,
        cancellationReason: appointments.cancellationReason,
        cancelledAt: appointments.cancelledAt,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
      })
      .from(appointments)
      .innerJoin(departments, eq(appointments.departmentId, departments.id))
      .leftJoin(users, eq(appointments.userId, users.id))
      .where(and(eq(appointments.id, appointmentId), eq(appointments.organizationId, organizationId)))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      ...row,
      status: row.status as AppointmentListItem['status'],
      assignmentMode: row.assignmentMode as AppointmentListItem['assignmentMode'],
      type: row.type as AppointmentListItem['type'],
      operatorName: row.operatorName ?? null,
    };
  }

  /**
   * Lista operarios asignables de un departamento, restringidos a la organización activa.
   */
  static async getAssignableOperatorsByDepartment(
    departmentId: string,
    organizationId: string,
  ): Promise<DepartmentAssignableMember[]> {
    const rows = await db
      .select({
        userId: users.id,
        fullName: users.fullName,
        email: users.email,
        isLead: departmentMembers.isLead,
      })
      .from(departmentMembers)
      .innerJoin(users, eq(departmentMembers.userId, users.id))
      .innerJoin(departments, eq(departmentMembers.departmentId, departments.id))
      .innerJoin(
        organizationMembers,
        and(
          eq(organizationMembers.userId, users.id),
          eq(organizationMembers.organizationId, departments.organizationId),
        ),
      )
      .where(
        and(
          eq(departmentMembers.departmentId, departmentId),
          eq(departmentMembers.isActive, true),
          eq(departments.organizationId, organizationId),
        ),
      )
      .orderBy(desc(departmentMembers.isLead), asc(users.fullName));

    return rows;
  }

  /**
   * Obtiene disponibilidad llamando al RPC SQL del motor de calendario.
   */
  static async getAvailability(
    requestEvent: AnyRequestEvent,
    query: AvailabilityQuery,
  ): Promise<AvailabilityResult> {
    const validated = AvailabilityQuerySchema.parse(query);
    const supabase = createServerSupabaseClient(requestEvent);

    const { data, error } = await supabase.rpc('get_time_window_availability', {
      p_organization_id: validated.organizationId,
      p_department_id: validated.departmentId,
      p_user_id: validated.userId,
      p_start_date: validated.startDate,
      p_end_date: validated.endDate,
      p_client_timezone: validated.clientTimezone,
    });

    if (error) {
      throw new Error(`Error obteniendo disponibilidad: ${error.message}`);
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return {};
    }

    const availability = Object.entries(data as Record<string, unknown>).reduce<AvailabilityResult>(
      (acc, [date, value]) => {
        if (Array.isArray(value)) {
          const safeTimes = value.filter((item): item is string => typeof item === 'string');
          acc[date] = safeTimes;
        } else {
          acc[date] = [];
        }
        return acc;
      },
      {},
    );

    return availability;
  }

  /**
   * Crea cita a través del RPC `book_appointment`.
   *
   * El RPC aplica validación transaccional anti double-booking vía GIST.
   */
  static async bookAppointment(
    requestEvent: AnyRequestEvent,
    input: BookAppointmentInput,
  ): Promise<BookAppointmentSuccess | BookAppointmentError> {
    const validated = BookAppointmentInputSchema.parse(input);
    const supabase = createServerSupabaseClient(requestEvent);

    const { data, error } = await supabase.rpc('book_appointment', {
      p_organization_id: validated.organizationId,
      p_department_id: validated.departmentId,
      p_client_name: validated.clientName,
      p_client_phone: validated.clientPhone,
      p_start_at: validated.startAt,
      p_user_id: validated.userId,
      p_assignment_mode: validated.assignmentMode,
    });

    if (error) {
      throw new Error(`Error reservando cita: ${error.message}`);
    }

    const successResult = BookAppointmentSuccessSchema.safeParse(data);
    if (successResult.success) {
      return successResult.data;
    }

    const errorResult = BookAppointmentErrorSchema.safeParse(data);
    if (errorResult.success) {
      return errorResult.data;
    }

    return {
      error: 'invalid_rpc_response',
      message: 'La respuesta del RPC book_appointment no tiene el formato esperado.',
    };
  }

  /**
   * Asigna operario a una cita PENDING y la confirma.
   *
   * Regla de negocio:
   * - El operario debe pertenecer al departamento (`department_members.is_active=true`)
   * - La cita debe pertenecer a la organización solicitada
   */
  static async assignOperator(input: AssignOperatorInput) {
    const { appointmentId, organizationId, userId, assignedByUserId, assignmentMode = 'manual' } = input;

    return db.transaction(async (tx) => {
      const [current] = await tx
        .select({
          id: appointments.id,
          departmentId: appointments.departmentId,
          status: appointments.status,
        })
        .from(appointments)
        .where(and(eq(appointments.id, appointmentId), eq(appointments.organizationId, organizationId)))
        .limit(1);

      if (!current) {
        throw new Error('La cita no existe o no pertenece a la organización activa.');
      }

      if (current.status === 'CANCELLED') {
        throw new Error('No se puede asignar operario a una cita cancelada.');
      }

      const [membership] = await tx
        .select({ id: departmentMembers.id })
        .from(departmentMembers)
        .where(
          and(
            eq(departmentMembers.departmentId, current.departmentId),
            eq(departmentMembers.userId, userId),
            eq(departmentMembers.isActive, true),
          ),
        )
        .limit(1);

      if (!membership) {
        throw new Error('El usuario no está habilitado como operario para este departamento.');
      }

      const [updated] = await tx
        .update(appointments)
        .set({
          userId,
          assignedByUserId,
          assignmentMode,
          status: 'CONFIRMED',
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, appointmentId))
        .returning();

      return updated;
    });
  }

  /** Obtiene el calendario base semanal de una entidad. */
  static async getSchedule(targetType: 'ORGANIZATION' | 'DEPARTMENT' | 'USER', targetId: string) {
    const [row] = await db
      .select()
      .from(calendarSchedules)
      .where(and(eq(calendarSchedules.targetType, targetType), eq(calendarSchedules.targetId, targetId)))
      .limit(1);

    return row ?? null;
  }

  /**
   * Crea o actualiza el patrón semanal (`calendar_schedules`) con upsert.
   */
  static async upsertSchedule(input: CalendarScheduleInput) {
    const validated = CalendarScheduleInputSchema.parse(input);

    const [row] = await db
      .insert(calendarSchedules)
      .values({
        targetType: validated.targetType,
        targetId: validated.targetId,
        timezone: validated.timezone,
        weeklyHours: validated.weeklyHours,
      })
      .onConflictDoUpdate({
        target: [calendarSchedules.targetType, calendarSchedules.targetId],
        set: {
          timezone: validated.timezone,
          weeklyHours: validated.weeklyHours,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  /**
   * Lista excepciones por target, opcionalmente filtradas por rango de fechas.
   */
  static async listExceptions(
    targetType: 'ORGANIZATION' | 'DEPARTMENT' | 'USER',
    targetId: string,
    range?: { from?: string; to?: string },
  ) {
    const whereClauses = [
      eq(calendarExceptions.targetType, targetType),
      eq(calendarExceptions.targetId, targetId),
    ];

    if (range?.from) {
      whereClauses.push(gte(calendarExceptions.exceptionDate, range.from));
    }

    if (range?.to) {
      whereClauses.push(lte(calendarExceptions.exceptionDate, range.to));
    }

    return db
      .select()
      .from(calendarExceptions)
      .where(and(...whereClauses))
      .orderBy(asc(calendarExceptions.exceptionDate));
  }

  /**
   * Crea o actualiza excepción de calendario por (target_type, target_id, exception_date).
   */
  static async upsertException(input: CalendarExceptionInput) {
    const validated = CalendarExceptionInputSchema.parse(input);

    const [row] = await db
      .insert(calendarExceptions)
      .values({
        targetType: validated.targetType,
        targetId: validated.targetId,
        exceptionDate: validated.exceptionDate,
        isClosed: validated.isClosed,
        customHours: validated.customHours ?? null,
        description: validated.description ?? null,
      })
      .onConflictDoUpdate({
        target: [
          calendarExceptions.targetType,
          calendarExceptions.targetId,
          calendarExceptions.exceptionDate,
        ],
        set: {
          isClosed: validated.isClosed,
          customHours: validated.customHours ?? null,
          description: validated.description ?? null,
        },
      })
      .returning();

    return row;
  }

  /** Elimina una excepción concreta por ID. */
  static async deleteException(exceptionId: string, targetId: string) {
    const [row] = await db
      .delete(calendarExceptions)
      .where(and(eq(calendarExceptions.id, exceptionId), eq(calendarExceptions.targetId, targetId)))
      .returning({ id: calendarExceptions.id });

    return row ?? null;
  }
}
