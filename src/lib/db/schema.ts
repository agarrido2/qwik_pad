/**
 * Drizzle ORM Schema - Onucall Auto
 * 
 * Arquitectura Multi-Tenant N:M con Multi-Agente:
 * - Users pueden pertenecer a múltiples Organizations (consultores, franquicias)
 * - Organizations pueden tener múltiples Users con roles diferentes
 * - Organizations pueden tener N Voice Agents, cada uno con su propia configuración
 * 
 * Free Tier Strategy:
 * - subscription_tier = 'free' → Preview mode, datos demo generados en onboarding
 * - voice_agents.retell_agent_id y voice_agents.phone_number_id son NULL en free tier
 * 
 * Refactor Multi-Agente (2026-02-21):
 * - Eliminada tabla agent_profiles (limitación 1:1 con users)
 * - Nueva tabla voice_agents (relación N:1 con organizations)
 * - Renombrada assigned_numbers → phone_numbers
 * - Simplificada organizations (campos de agente movidos a voice_agents)
 *
 * Refactor Contacts + Scheduling v2 (2026-02-23):
 * - Nueva tabla contacts: ciclo de vida único prospect→lead→qualified→client
 * - Nueva tabla contacts reemplaza clientName/clientPhone/clientEmail inline
 * - appointments: startAt/endAt nullable para soportar callbacks sin hora fija
 * - appointments: nuevo campo notes, appointmentType, callbackPreferredAt
 */

import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, unique, integer, index, date, check } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ==========================================
// ENUMS
// ==========================================

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free',      // Demo mode, audios estáticos, datos simulados, 0 costos de API
  'starter',   // 1 número Zadarme, agente básico Retell AI
  'pro',       // Múltiples números, integraciones CRM/Agenda
  'enterprise' // Custom: volumen alto, soporte dedicado
]);

export const assistantGenderEnum = pgEnum('assistant_gender', [
  'male',   // Hombre
  'female'  // Mujer
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',      // Suscripción activa
  'trialing',    // En periodo de prueba (14 días)
  'canceled',    // Cancelada por el usuario
  'past_due',    // Pago vencido
  'incomplete'   // Pago inicial fallido
]);

export const userRoleEnum = pgEnum('user_role', [
  'owner',  // Propietario de la organización (full access)
  'admin',  // Administrador (casi full access)
  'member'  // Miembro regular (access limitado)
]);

export const phoneNumberStatusEnum = pgEnum('phone_number_status', [
  'available',  // Número disponible para asignar
  'assigned',   // Número asignado a un agente
  'suspended'   // Número suspendido temporalmente
]);

export const calendarTargetTypeEnum = pgEnum('calendar_target_type', [
  'ORGANIZATION', // Calendario de la empresa (horario global, festivos)
  'DEPARTMENT',   // Calendario del servicio (slot_duration, horario propio)
  'USER',         // Calendario del operario (turnos, vacaciones, bajas)
]);

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'PENDING',    // Recibida, pendiente de asignación a operario
  'CONFIRMED',  // Asignada y confirmada
  'CANCELLED',  // Cancelada (libera el hueco, nunca se borra)
]);

export const assignmentModeEnum = pgEnum('assignment_mode', [
  'manual', // El admin asigna la cita manualmente al operario
  'ai',     // La IA decide el operario basándose en disponibilidad/carga
]);

export const appointmentTypeEnum = pgEnum('appointment_type', [
  'appointment', // Cita presencial con hora exacta (bloquea agenda vía GIST)
  'callback',    // Llamada saliente sin hora fija (startAt/endAt son NULL)
  'visit',       // Visita al concesionario u otros (hora exacta, bloquea agenda)
]);

export const contactStatusEnum = pgEnum('contact_status', [
  'prospect',  // Captado por la IA, datos mínimos (nombre, teléfono)
  'lead',      // Interés confirmado, pendiente de qualificación
  'qualified', // Cualificado comercialmente, en negociación activa
  'client',    // Conversión completada
  'inactive',  // Sin actividad o descartado
]);

export const contactSourceEnum = pgEnum('contact_source', [
  'call',   // Captado en llamada entrante por agente IA
  'web',    // Formulario web / landing page
  'manual', // Creado manualmente por el equipo
  'import', // Importado desde CSV / CRM externo
]);

// ==========================================
// TABLA: organizations
// ==========================================

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Identificación
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // Para URLs: app.onucall.com/{slug}
  
  // Datos de contacto (Onboarding Paso 1)
  phone: text('phone'), // Teléfono del negocio
  
  // Subscription
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').notNull().default('active'),
  
  // Metadata de negocio (Onboarding Paso 2)
  sector: text('sector').default('concesionario'), // Vertical de negocio (Onucall Auto: concesionario)
  businessDescription: text('business_description'), // Descripción del negocio
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sectorConcesionarioChk: check(
    'organizations_sector_concesionario_chk',
    sql`${table.sector} IS NULL OR ${table.sector} = 'concesionario'`
  ),
}));

// ==========================================
// TABLA: users
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Mismo ID que auth.users de Supabase
  
  // Perfil
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  
  // DECISIÓN ARQUITECTÓNICA (2026-02-14):
  // users.role es un ROL DE PLATAFORMA (invited | active | suspended), NO un rol organizacional.
  // organization_members.role usa userRoleEnum (owner | admin | member) para RBAC.
  // Se mantiene como text() porque:
  // 1. 'invited' no está en userRoleEnum (que es para org members)
  // 2. Son conceptos diferentes: plataforma vs organización
  // 3. Los valores podrían evolucionar sin migración de enum
  role: text('role').notNull().default('invited'),
  isActive: boolean('is_active').notNull().default(true),
  subscriptionTier: text('subscription_tier').notNull().default('free'),
  
  // Estado de onboarding
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  trialStartedAt: timestamp('trial_started_at', { withTimezone: true }),
  signupIp: text('signup_ip'),
  lastLoginIp: text('last_login_ip'),
  signupFingerprint: text('signup_fingerprint'),
  suspiciousActivityFlags: integer('suspicious_activity_flags').default(0),
  ipAddress: text('ip_address'),
  timezone: text('timezone').default('Europe/Madrid'),
  locale: text('locale').default('es'),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // RBAC Performance Indexes (añadidos 2026-02-14)
  // Índice para queries de filtrado por role (ej: admin panel listando users)
  roleIdx: index('idx_users_role').on(table.role),
  // Índice para queries de usuarios activos
  isActiveIdx: index('idx_users_is_active').on(table.isActive),
  // Índice para queries de onboarding completado
  onboardingIdx: index('idx_users_onboarding').on(table.onboardingCompleted),
}));

// ==========================================
// TABLA: organization_members (N:M)
// ==========================================

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Relaciones
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Rol del usuario en esta organización específica
  role: userRoleEnum('role').notNull().default('member'),
  
  // Timestamps
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  // Constraint: un usuario solo puede tener 1 rol por organización
  uniqueUserOrg: unique().on(table.userId, table.organizationId),
  
  // RBAC Performance Indexes (añadidos 2026-02-14)
  // Índice para buscar miembros por organización
  orgIdIdx: index('idx_org_members_org_id').on(table.organizationId),
  // Índice para buscar organizaciones por usuario
  userIdIdx: index('idx_org_members_user_id').on(table.userId),
  // Índice para queries por rol (ej: buscar todos los owners)
  roleIdx: index('idx_org_members_role').on(table.role),
  // Índice compuesto para "todos los owners de org X" (alta performance)
  orgRoleIdx: index('idx_org_members_org_role').on(table.organizationId, table.role),
  // Índice compuesto para "todas las orgs donde soy owner"
  userRoleIdx: index('idx_org_members_user_role').on(table.userId, table.role),
}));

// ==========================================
// TABLA: audit_role_changes (Auditoría RBAC)
// ==========================================

/**
 * Audit Role Changes Table
 * @description Registro de auditoría para cambios de rol en organization_members.
 * Se alimenta vía trigger log_role_change() para trazabilidad de seguridad.
 */
export const auditRoleChanges = pgTable('audit_role_changes', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Contexto multi-tenant
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Usuario cuyo rol cambió
  targetUserId: uuid('target_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Usuario que ejecutó el cambio (puede ser null en casos legacy)
  changedByUserId: uuid('changed_by_user_id')
    .references(() => users.id, { onDelete: 'set null' }),

  // Diff de rol
  oldRole: userRoleEnum('old_role'),
  newRole: userRoleEnum('new_role').notNull(),

  // Metadata de auditoría
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Queries de historial por organización
  orgIdx: index('idx_audit_role_changes_org').on(table.organizationId),
  // Queries de historial por usuario objetivo
  targetUserIdx: index('idx_audit_role_changes_target_user').on(table.targetUserId),
  // Queries temporales (últimos cambios)
  changedAtIdx: index('idx_audit_role_changes_changed_at').on(table.changedAt),
  // Pattern común: historial de un usuario en una organización
  orgUserIdx: index('idx_audit_role_changes_org_user').on(table.organizationId, table.targetUserId),
}));

// ==========================================
// TABLA: departments (Catálogo por Organización)
// ==========================================

/**
 * Departments Table
 * @description Departamentos operativos por organización para filtrar agenda.
 */
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),

  organizationId: uuid('org_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull(),
  slug: text('slug').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),

  // Motor de calendario: configuración de citas
  slotDurationMinutes: integer('slot_duration_minutes').notNull().default(60),
  bufferBeforeMinutes: integer('buffer_before_minutes').notNull().default(0),
  bufferAfterMinutes: integer('buffer_after_minutes').notNull().default(0),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueOrgSlug: unique().on(table.organizationId, table.slug),
  orgIdx: index('idx_departments_org').on(table.organizationId),
  orgActiveIdx: index('idx_departments_org_active').on(table.organizationId, table.isActive),
}));

// ==========================================
// TABLA: department_members (Pivot N:M Dept ↔ Users)
// ==========================================

/**
 * Department Members Table
 * @description Qué operarios (users) pueden atender citas de cada departamento.
 * Un user puede estar en múltiples departments. Un department puede tener N users.
 * Cuando llega una cita al department, el admin (o la IA) asigna a uno de estos members.
 */
export const departmentMembers = pgTable('department_members', {
  id: uuid('id').primaryKey().defaultRandom(),

  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'cascade' }),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Un operario puede ser el responsable principal del departamento
  isLead: boolean('is_lead').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),

  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Un user solo puede pertenecer 1 vez a cada department
  uniqueDeptUser: unique().on(table.departmentId, table.userId),
  deptIdx: index('idx_dept_members_dept').on(table.departmentId),
  userIdx: index('idx_dept_members_user').on(table.userId),
  deptActiveIdx: index('idx_dept_members_dept_active').on(table.departmentId, table.isActive),
}));

// ==========================================
// TABLA: calendar_schedules (Patrón Base Semanal)
// ==========================================

/**
 * Calendar Schedules Table
 * @description Horario base semanal de cada entidad (Org / Dept / User).
 * No guarda fechas exactas, sino el patrón repetitivo por día de semana (ISODOW 1-7).
 *
 * Formato weekly_hours:
 * { "1": [{"start":"09:00","end":"14:00"},{"start":"17:00","end":"20:00"}], "6": [], "7": [] }
 * Claves ausentes o con [] = cerrado ese día.
 *
 * Cada entidad tiene máximo 1 registro en esta tabla (unique target_type + target_id).
 */
export const calendarSchedules = pgTable('calendar_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),

  targetType: calendarTargetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),

  // Zona horaria de la entidad. Crítico para conversión de horas en el RPC.
  timezone: text('timezone').notNull().default('Europe/Madrid'),

  // Patrón semanal ISODOW. Validado en capa de servicio con Zod antes del INSERT.
  weeklyHours: jsonb('weekly_hours').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Búsqueda ultra-rápida por entidad (el JOIN más frecuente del RPC)
  targetIdx: index('idx_calendar_schedules_target').on(table.targetType, table.targetId),
  // Cada entidad solo puede tener 1 calendario base
  uniqueTarget: unique().on(table.targetType, table.targetId),
}));

// ==========================================
// TABLA: calendar_exceptions (Overrides y Festivos)
// ==========================================

/**
 * Calendar Exceptions Table
 * @description Sobrescribe el horario base en días puntuales.
 * Es la tabla que el administrador gestiona desde el panel visual.
 *
 * Prioridad en el RPC:
 * 1. Si is_closed = true → ese día devuelve [] (cerrado total)
 * 2. Si custom_hours IS NOT NULL → usa esos horarios ese día
 * 3. Si no hay excepción → usa weekly_hours del patrón base
 */
export const calendarExceptions = pgTable('calendar_exceptions', {
  id: uuid('id').primaryKey().defaultRandom(),

  targetType: calendarTargetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),

  // Fecha exacta sobrescrita. Tipo date de PostgreSQL (sin hora).
  exceptionDate: date('exception_date').notNull(),

  // true = día completamente cerrado, sin importar custom_hours
  isClosed: boolean('is_closed').notNull().default(true),

  // Si el día no está cerrado del todo, aplica este horario especial
  customHours: jsonb('custom_hours'),

  // Motivo legible para el administrador: "Baja médica", "Inventario", "Festivo local"
  description: text('description'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // JOIN crítico del RPC: buscar excepciones de una entidad en un rango de fechas
  targetDateIdx: index('idx_calendar_exceptions_target_date').on(table.targetId, table.exceptionDate),
  // No puede haber dos excepciones para la misma entidad el mismo día
  uniqueTargetDate: unique().on(table.targetType, table.targetId, table.exceptionDate),
}));

// ==========================================
// TABLA: appointments (Reservas Confirmadas)
// ==========================================

/**
 * Appointments Table
 * @description Citas confirmadas. El motor de disponibilidad las resta
 * antes de devolver huecos libres a la IA.
 *
 * Flujo:
 * 1. IA detecta intención de reserva → llama RPC get_time_window_availability
 * 2. Cliente elige hueco → IA llama RPC book_appointment → INSERT con status PENDING
 * 3. Admin (o IA) asigna operario → UPDATE user_id + status CONFIRMED
 * 4. Si se cancela → UPDATE status CANCELLED (nunca DELETE, para historial)
 *
 * El constraint GIST de exclusión (aplicado vía migración SQL manual)
 * garantiza que dos citas CONFIRMED nunca se solapen en el mismo department.
 */
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Multi-tenant
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Servicio que atiende la cita (OBLIGATORIO siempre)
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),

  // Operario asignado (NULL hasta que admin/IA lo asigne)
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'set null' }),

  // Quién realizó la asignación (para auditoría)
  assignedByUserId: uuid('assigned_by_user_id')
    .references(() => users.id, { onDelete: 'set null' }),

  // Cómo se asignó el operario
  assignmentMode: assignmentModeEnum('assignment_mode'),

  // Tipo de interacción
  type: appointmentTypeEnum('type').notNull().default('appointment'),

  // Contacto vinculado (FK a contacts — nullable para compat con registros legacy)
  // Cuando Elena crea la cita, crea/vincula el contact en la misma transacción.
  contactId: uuid('contact_id')
    .references(() => contacts.id, { onDelete: 'set null' }),

  // Datos del cliente (desnormalizados para snapshot histórico inmutable)
  // Se rellenan desde contacts en el momento de la reserva.
  clientName: text('client_name').notNull(),
  clientPhone: text('client_phone').notNull(),

  // Contexto libre de la llamada/visita (generado por IA o editado por el admin)
  // Ej: "Sra. Cristina quiere ver piso ref:130A, viene con su marido"
  // Ej: "Sr. Pastor quiere callback sobre SEAT Ateca, prefiere tardes"
  notes: text('notes'),

  // Rango temporal exacto (incluye buffer_before y buffer_after del department)
  // NULLABLE para callbacks (type = 'callback') sin hora fija.
  // El constraint GIST de exclusión ignora NULLs → no genera falsos conflictos.
  startAt: timestamp('start_at', { withTimezone: true }),
  endAt: timestamp('end_at', { withTimezone: true }),

  // Para callbacks: marca temporal aproximada de cuándo debe producirse la llamada.
  // No bloquea agenda. Sirve para ordenar la cola de callbacks del equipo.
  // Ej: NOW() + 2 days cuando cliente dice "en un par de días".
  callbackPreferredAt: timestamp('callback_preferred_at', { withTimezone: true }),

  // Estado de la cita
  status: appointmentStatusEnum('status').notNull().default('PENDING'),

  // Cancelación (solo si status = CANCELLED)
  cancellationReason: text('cancellation_reason'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Multi-tenant: listado de citas por organización
  orgIdx: index('idx_appointments_org').on(table.organizationId),
  // Índice PARCIAL: solo CONFIRMED bloquean huecos (las CANCELLED/PENDING no cuentan)
  // NOTA: el índice parcial WHERE status='CONFIRMED' y el constraint GIST de exclusión
  // se aplican vía migración SQL manual (Drizzle no soporta EXCLUDE USING GIST)
  deptDateIdx: index('idx_appointments_dept_date').on(table.departmentId, table.startAt, table.endAt),
  // Panel de operario: mis citas
  userDateIdx: index('idx_appointments_user_date').on(table.userId, table.startAt),
  // Listado admin: todas las citas de la org por fecha
  orgDateIdx: index('idx_appointments_org_date').on(table.organizationId, table.startAt),
  // Citas pendientes de asignación (dashboard admin)
  pendingIdx: index('idx_appointments_pending').on(table.departmentId, table.status),
}));

// ==========================================
// TABLA: contacts (Ciclo de Vida Único del Contacto)
// ==========================================

/**
 * Contacts Table
 * @description Tabla única de contactos con ciclo de vida completo.
 * El estado (status) describe en qué momento del embudo comercial está.
 *
 * Ciclo de vida:
 *   prospect → lead → qualified → client
 *                                ↘ inactive
 *
 * Creación inicial: Elena (IA) captura name + phone (+ email si lo da).
 * Enriquecimiento posterior: el equipo añade address, notes, etc.
 * Un contacto puede tener N appointments/callbacks a lo largo del tiempo.
 */
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Multi-tenant
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Agente IA que captó el contacto (nullable: puede ser creado manualmente)
  agentId: uuid('agent_id')
    .references(() => voiceAgents.id, { onDelete: 'set null' }),

  // Ciclo de vida
  status: contactStatusEnum('status').notNull().default('prospect'),
  source: contactSourceEnum('source').notNull().default('call'),

  // Datos capturados por la IA en la llamada (núcleo mínimo)
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),

  // Datos enriquecidos por el equipo comercial
  address: text('address'),
  notes: text('notes'), // Observaciones libres: contexto, preferencias, historial

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('idx_contacts_org').on(table.organizationId),
  orgStatusIdx: index('idx_contacts_org_status').on(table.organizationId, table.status),
  orgSourceIdx: index('idx_contacts_org_source').on(table.organizationId, table.source),
  agentIdx: index('idx_contacts_agent').on(table.agentId),
  // Búsqueda rápida por teléfono dentro de la org (deduplicación)
  orgPhoneIdx: index('idx_contacts_org_phone').on(table.organizationId, table.phone),
}));

// ==========================================
// TABLA: call_flow_templates (Plantillas de Flujo)
// ==========================================

export const callFlowTemplates = pgTable('call_flow_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Slug del vertical activo (Onucall Auto: concesionario)
  sector: text('sector').default('concesionario'),
  
  name: text('name').notNull(),
  description: text('description'),
  
  // Configuración del flujo (steps, conditions, etc.)
  flowConfig: jsonb('flow_config').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sectorConcesionarioChk: check(
    'call_flow_templates_sector_concesionario_chk',
    sql`${table.sector} IS NULL OR ${table.sector} = 'concesionario'`
  ),
}));

// ==========================================
// TABLA: users_demo (Demo público)
// ==========================================

/**
 * Users Demo Table
 * @deprecated La demo pública fue retirada (2026-02-24). Las rutas `/routes/(public)/`
 * y `src/features/demo/` fueron eliminadas. Esta tabla se mantiene en la DB para
 * preservar datos históricos y seguimiento de conversiones pasadas.
 * NO crear nuevas referencias a esta tabla en el código de aplicación.
 *
 * @description Registro de usuarios que solicitaron demo pública.
 * Flujo original: Formulario → Email OTP → Llamada Retell → Post-call analytics
 */
export const usersDemo = pgTable('users_demo', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  sector: text('sector').notNull(),
  ipAddress: text('ip_address').notNull(),
  retellCallId: text('retell_call_id'), // Nullable hasta que Retell responda
  durationCall: integer('duration_call').default(0),
  
  // Verificación por email (2-step flow)
  status: text('status').notNull().default('pending_verification'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verificationType: text('verification_type').default('email_otp'),
  
  // Satisfacción post-llamada
  satisfaction: integer('satisfaction').default(0).notNull(),
  
  // Marketing Intelligence (UTM tracking)
  resourceOrigin: text('resource_origin'),  // UTM source
  utmCampaign: text('utm_campaign'),        // UTM campaign
  utmMedium: text('utm_medium'),            // UTM medium
  
  // Conversión a organización (B2B)
  convertedOrgId: uuid('converted_org_id').references(() => organizations.id),
  
  // Datos post-llamada (webhook Retell)
  scoreSentiment: text('score_sentiment'),  // positive | negative | neutral
  urlRecord: text('url_record'),            // URL grabación
  retellData: jsonb('retell_data'),         // Payload completo Retell
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('idx_users_demo_status').on(table.status),
  emailStatusIdx: index('idx_users_demo_email_status').on(table.email, table.status),
  resourceOriginIdx: index('idx_users_demo_resource_origin').on(table.resourceOrigin),
}));

// ==========================================
// TABLA: ip_trials (Anti-Abuse)
// ==========================================

/**
 * IP Trials Table
 * @description Control anti-abuse por IP - Limita trials por dirección
 */
export const ipTrials = pgTable('ip_trials', {
  ipAddress: text('ip_address').primaryKey(),
  trialCount: integer('trial_count').notNull().default(0),
  blockedAt: timestamp('blocked_at', { withTimezone: true }),
  blockedReason: text('blocked_reason'),
  lastTrialAt: timestamp('last_trial_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  blockedIdx: index('idx_ip_trials_blocked').on(table.ipAddress),
}));

// ==========================================
// TABLA: voice_agents (Agentes de Voz IA)
// ==========================================

/**
 * Voice Agents Table
 * @description Agentes de voz con IA configurables por organización.
 * Arquitectura Multi-Agente: Una organización puede tener N agentes,
 * cada uno con su propia personalidad, configuración y número de teléfono.
 * 
 * Casos de uso (Onucall Auto - Concesionarios):
 * - Agente "Nuevos": Captación de leads de vehículos nuevos
 * - Agente "Ocasión": Captación de leads de vehículos de segunda mano
 * - Agente "Taller": Gestión de citas de mantenimiento y reparación
 */
export const voiceAgents = pgTable('voice_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Propiedad (relación N:1 con organizations)
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Identidad del Agente
  name: text('name').notNull(), // "Ventas Nuevos", "Agente Ocasión", "Taller"
  description: text('description'), // Descripción interna del propósito
  sector: text('sector').default('concesionario'), // Vertical del agente (Onucall Auto: concesionario)
  
  // Integración Externa (Retell AI + Número)
  retellAgentId: text('retell_agent_id').unique(), // UUID del agente en Retell AI
  phoneNumberId: uuid('phone_number_id').unique(), // FK a phone_numbers (1:1)
  
  // Configuración de Voz y Personalidad
  assistantName: text('assistant_name').notNull().default('Asistente'), // "Ana", "Carlos"
  assistantGender: assistantGenderEnum('assistant_gender').notNull().default('female'),
  friendlinessLevel: integer('friendliness_level').notNull().default(3), // 1-5
  warmthLevel: integer('warmth_level').notNull().default(3), // 1-5 (antes kindness)
  
  // Configuración de Negocio
  businessDescription: text('business_description'), // Prompt base del agente
  promptSystem: text('prompt_system'), // Prompt completo personalizado
  transferPolicy: text('transfer_policy'), // Cuándo transferir a humano
  leadsEmail: text('leads_email'), // Email para leads capturados
  webhookUrl: text('webhook_url'), // Webhook post-llamada (opcional)
  
  // Estado y Control
  isActive: boolean('is_active').notNull().default(true), // Agente activo/inactivo
  isDefault: boolean('is_default').notNull().default(false), // ¿Agente por defecto?
  
  // Auditoría
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }), // Quién creó el agente
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Índice para buscar agentes por organización
  orgIdIdx: index('idx_voice_agents_org').on(table.organizationId),
  // Índice para buscar agentes activos por organización
  orgActiveIdx: index('idx_voice_agents_org_active').on(table.organizationId, table.isActive),
  // Índice para buscar por retell_agent_id (webhook lookups)
  retellIdx: index('idx_voice_agents_retell').on(table.retellAgentId),
  // Índice para buscar agentes por sector
  sectorIdx: index('idx_voice_agents_sector').on(table.sector),
  // Guardrail de dominio: Onucall Auto opera solo vertical concesionario
  sectorConcesionarioChk: check(
    'voice_agents_sector_concesionario_chk',
    sql`${table.sector} IS NULL OR ${table.sector} = 'concesionario'`
  ),
}));

// ==========================================
// TABLA: phone_numbers (Pool de Números)
// ==========================================

/**
 * Phone Numbers Table
 * @description Pool de números virtuales (Zadarma/Twilio) gestionados por Onucall.
 * Arquitectura: 1 número → 1 agente (voice_agents.phone_number_id → phone_numbers.id)
 * 
 * Status:
 * - available: Número disponible para asignar a un agente
 * - assigned: Número asignado a un agente activo
 * - suspended: Número temporalmente suspendido
 */
export const phoneNumbers = pgTable('phone_numbers', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Identificación del Número
  phoneNumber: text('phone_number').notNull().unique(), // +34919930992
  phoneNumberFormatted: text('phone_number_formatted').notNull(), // +34 919 93 09 92
  prefix: text('prefix').notNull().default('+34'),
  location: text('location').notNull(), // Madrid, España
  
  // Proveedor
  provider: text('provider').notNull().default('zadarma'), // zadarma | twilio | vonage
  providerId: text('provider_id'), // ID en el sistema del proveedor
  
  // Propiedad (B2B)
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'set null' }),
  
  // Asignación a Agente (establecida desde voice_agents.phone_number_id)
  assignedToAgentId: uuid('assigned_to_agent_id')
    .unique() // 1:1 - Un número solo puede estar asignado a un agente
    .references(() => voiceAgents.id, { onDelete: 'set null' }),
  
  // Estado
  status: phoneNumberStatusEnum('status').notNull().default('available'),
  
  // Fechas
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Índice para buscar números por organización
  orgIdx: index('idx_phone_numbers_org').on(table.organizationId),
  // Índice para buscar números por agente asignado
  agentIdx: index('idx_phone_numbers_agent').on(table.assignedToAgentId),
  // Índice para buscar números por status
  statusIdx: index('idx_phone_numbers_status').on(table.status),
  // Índice para buscar números disponibles por organización
  orgStatusIdx: index('idx_phone_numbers_org_status').on(table.organizationId, table.status),
}));

// ==========================================
// TABLA: pending_invitations (Invitaciones N:M)
// ==========================================

/**
 * Pending Invitations Table
 * @description Invitaciones pendientes para unirse a una organización.
 * Flujo: Owner/Admin invita por email → se crea registro aquí →
 *        usuario acepta → se crea organization_member → se elimina invitación.
 * 
 * Ref: guards.ts - Los usuarios 'invited' no están en organization_members
 *      hasta que aceptan la invitación via este flujo.
 */
export const pendingInvitations = pgTable('pending_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Organización que invita
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),

  // Email del invitado (puede no tener cuenta aún)
  email: text('email').notNull(),

  // Rol que tendrá al aceptar la invitación
  role: userRoleEnum('role').notNull().default('member'),

  // Quién envió la invitación
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Token único para el link de invitación
  token: text('token').notNull().unique(),

  // Estado de la invitación
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Constraint: solo 1 invitación activa por email+org
  uniqueEmailOrg: unique().on(table.email, table.organizationId),
  // Índice para buscar invitaciones por email (login flow)
  emailIdx: index('idx_pending_invitations_email').on(table.email),
  // Índice para buscar invitaciones por organización (admin panel)
  orgIdx: index('idx_pending_invitations_org').on(table.organizationId),
}));

// ==========================================
// RELATIONS (Drizzle Query API)
// ==========================================

/**
 * Relations mejoran la inferencia de tipos en JOINs y habilitan
 * la Drizzle Query API (db.query.users.findMany({ with: { ... } }))
 * 
 * NOTA: Las relations NO generan constraints SQL. Los FK constraints
 * están definidos en las tablas con .references().
 */

export const usersRelations = relations(users, ({ many }) => ({
  /** Organizaciones a las que pertenece (N:M via organization_members) */
  organizationMemberships: many(organizationMembers),
  /** Departamentos en los que opera como operario */
  departmentMemberships: many(departmentMembers),
  /** Citas asignadas a este operario */
  assignedAppointments: many(appointments),
  /** Invitaciones enviadas */
  sentInvitations: many(pendingInvitations),
  /** Agentes de voz creados por este usuario */
  createdVoiceAgents: many(voiceAgents),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  /** Miembros de la organización (N:M via organization_members) */
  members: many(organizationMembers),
  /** Departamentos de agenda */
  departments: many(departments),
  /** Agentes de voz de la organización */
  voiceAgents: many(voiceAgents),
  /** Números de teléfono contratados */
  phoneNumbers: many(phoneNumbers),
  /** Invitaciones pendientes */
  pendingInvitations: many(pendingInvitations),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  /** Organización propietaria del departamento */
  organization: one(organizations, {
    fields: [departments.organizationId],
    references: [organizations.id],
  }),
  /** Operarios asignados a este departamento */
  members: many(departmentMembers),
  /** Citas gestionadas por este departamento */
  appointments: many(appointments),
}));

export const departmentMembersRelations = relations(departmentMembers, ({ one }) => ({
  /** Departamento al que pertenece */
  department: one(departments, {
    fields: [departmentMembers.departmentId],
    references: [departments.id],
  }),
  /** Operario */
  user: one(users, {
    fields: [departmentMembers.userId],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  /** Organización propietaria */
  organization: one(organizations, {
    fields: [appointments.organizationId],
    references: [organizations.id],
  }),
  /** Departamento/servicio que atiende */
  department: one(departments, {
    fields: [appointments.departmentId],
    references: [departments.id],
  }),
  /** Operario asignado */
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  /** Quién hizo la asignación */
  assignedByUser: one(users, {
    fields: [appointments.assignedByUserId],
    references: [users.id],
  }),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  /** Usuario miembro */
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
  /** Organización */
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
}));

export const auditRoleChangesRelations = relations(auditRoleChanges, ({ one }) => ({
  /** Organización donde ocurrió el cambio */
  organization: one(organizations, {
    fields: [auditRoleChanges.organizationId],
    references: [organizations.id],
  }),
  /** Usuario cuyo rol fue modificado */
  targetUser: one(users, {
    fields: [auditRoleChanges.targetUserId],
    references: [users.id],
  }),
  /** Usuario que realizó el cambio */
  changedByUser: one(users, {
    fields: [auditRoleChanges.changedByUserId],
    references: [users.id],
  }),
}));

export const pendingInvitationsRelations = relations(pendingInvitations, ({ one }) => ({
  /** Organización que invita */
  organization: one(organizations, {
    fields: [pendingInvitations.organizationId],
    references: [organizations.id],
  }),
  /** Usuario que envió la invitación */
  inviter: one(users, {
    fields: [pendingInvitations.invitedBy],
    references: [users.id],
  }),
}));

export const voiceAgentsRelations = relations(voiceAgents, ({ one }) => ({
  /** Organización propietaria del agente */
  organization: one(organizations, {
    fields: [voiceAgents.organizationId],
    references: [organizations.id],
  }),
  /** Usuario que creó el agente */
  creator: one(users, {
    fields: [voiceAgents.createdBy],
    references: [users.id],
  }),
  /** Número de teléfono asignado (1:1) */
  phoneNumber: one(phoneNumbers, {
    fields: [voiceAgents.phoneNumberId],
    references: [phoneNumbers.id],
  }),
}));

export const phoneNumbersRelations = relations(phoneNumbers, ({ one }) => ({
  /** Organización propietaria */
  organization: one(organizations, {
    fields: [phoneNumbers.organizationId],
    references: [organizations.id],
  }),
  /** Agente al que está asignado */
  assignedAgent: one(voiceAgents, {
    fields: [phoneNumbers.assignedToAgentId],
    references: [voiceAgents.id],
  }),
}));

// ==========================================
// TIPOS EXPORTADOS (para TypeScript)
// ==========================================

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;

export type AuditRoleChange = typeof auditRoleChanges.$inferSelect;
export type NewAuditRoleChange = typeof auditRoleChanges.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type CallFlowTemplate = typeof callFlowTemplates.$inferSelect;
export type NewCallFlowTemplate = typeof callFlowTemplates.$inferInsert;

export type UserDemo = typeof usersDemo.$inferSelect;
export type NewUserDemo = typeof usersDemo.$inferInsert;

export type IpTrial = typeof ipTrials.$inferSelect;
export type NewIpTrial = typeof ipTrials.$inferInsert;

export type VoiceAgent = typeof voiceAgents.$inferSelect;
export type NewVoiceAgent = typeof voiceAgents.$inferInsert;

export type PhoneNumber = typeof phoneNumbers.$inferSelect;
export type NewPhoneNumber = typeof phoneNumbers.$inferInsert;

export type PendingInvitation = typeof pendingInvitations.$inferSelect;
export type NewPendingInvitation = typeof pendingInvitations.$inferInsert;

export type DepartmentMember = typeof departmentMembers.$inferSelect;
export type NewDepartmentMember = typeof departmentMembers.$inferInsert;

export type CalendarSchedule = typeof calendarSchedules.$inferSelect;
export type NewCalendarSchedule = typeof calendarSchedules.$inferInsert;

export type CalendarException = typeof calendarExceptions.$inferSelect;
export type NewCalendarException = typeof calendarExceptions.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

// Type helpers para enums
export type AssistantGender = (typeof assistantGenderEnum.enumValues)[number];
export type SubscriptionTier = (typeof subscriptionTierEnum.enumValues)[number];
export type PhoneNumberStatus = (typeof phoneNumberStatusEnum.enumValues)[number];
export type CalendarTargetType = (typeof calendarTargetTypeEnum.enumValues)[number];
export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];
export type AssignmentMode = (typeof assignmentModeEnum.enumValues)[number];
