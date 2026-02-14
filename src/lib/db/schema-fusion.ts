
/**
 * Drizzle ORM Schema - Onucall Database
 * @description Definición de tablas para el SaaS de llamadas con IA
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Roles globales del sistema (no organizacionales)
 * 
 * Jerarquía simplificada (3 niveles):
 * - superadmin: Creador del SaaS (Antonio), acceso cross-tenant a toda la plataforma
 * - standard: Usuario normal con ≥1 organización, acceso según members.role
 * - invited: Usuario en trial o pendiente de onboarding
 * 
 * NOTA: Los roles organizacionales (owner/admin/member) están en members.role
 * MIGRACIÓN: 2025-12-23 - Eliminados 'admin', 'manager', 'user' (duplicaban members.role)
 */
export const userRoleEnum = pgEnum('user_role', [
  'superadmin',
  'standard',
  'invited',
]);

/**
 * Sectores verticales de Onucall (5 sectores)
 * @description Usado en onboarding para determinar plantillas y defaults
 * NOTA: 'despacho' fue eliminado por tener un espacio de problemas demasiado amplio
 * NOTA: industry_type ENUM eliminado (2025-12-09) - usar solo industry_sector
 */
export const industrySectorEnum = pgEnum('industry_sector', [
  'concesionario',    // Concesionarios de Vehículos
  'inmobiliaria',     // Inmobiliarias
  'retail',           // Retail y Distribuidoras
  'alquiladora',      // Empresas Alquiladoras
  'sat',              // Servicios Técnicos (SAT)
]);

/**
 * Género del asistente de voz
 * @description Determina la voz de síntesis (masculina o femenina)
 */
export const assistantGenderEnum = pgEnum('assistant_gender', [
  'male',             // Voz masculina
  'female',           // Voz femenina
]);

// Enum: Roles de miembros en organizaciones (B2B Multi-Tenant)
export const memberRoleEnum = pgEnum('member_role', [
  'owner',    // Propietario de la organización (facturación)
  'admin',    // Administrador (gestión completa sin facturación)
  'member',   // Miembro (acceso limitado)
]);

// ============================================================================
// TABLES
// ============================================================================

/**
 * Users Table
 * @description Vinculada al auth.users de Supabase - Tabla maestra SaaS
 * LIMPIADO: 2025-12-09 - Campos de negocio movidos a agent_profiles
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  
  // Perfil básico (sincronizado desde auth.users)
  fullName: text('full_name'), // Nullable para OAuth sin nombre
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  
  // Rol y estado
  role: userRoleEnum('role').notNull().default('invited'),
  isActive: boolean('is_active').notNull().default(true),
  
  // Trial system
  trialEndsAt: timestamp('trial_ends_at'),
  trialStartedAt: timestamp('trial_started_at'),
  
  // Anti-abuse tracking
  signupIp: text('signup_ip'),
  lastLoginIp: text('last_login_ip'),
  signupFingerprint: text('signup_fingerprint'),
  suspiciousActivityFlags: integer('suspicious_activity_flags').default(0),
  
  // Suscripción
  subscriptionTier: text('subscription_tier').notNull().default('trial'),
  
  // Onboarding
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  
  // Auditoría y preferencias
  ipAddress: text('ip_address'), // IP del registro
  timezone: text('timezone').default('Europe/Madrid'),
  locale: text('locale').default('es'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
}, (table) => ({
  isActiveIdx: index('idx_users_is_active').on(table.isActive),
  onboardingIdx: index('idx_users_onboarding').on(table.onboardingCompleted),
  // RBAC: Índice para queries de superadmin (filtrar por role global)
  roleIdx: index('idx_users_role').on(table.role),
}));

/**
 * Organizations Table
 * @description Entidad que representa al Negocio (B2B Multi-Tenant)
 * @created 2025-12-22 - Migración B2B: Organización como núcleo de facturación
 * 
 * Concepto clave: La organización es la entidad que PAGA y POSEE los datos.
 * Un usuario individual (empleado, secretaria) no paga, sino que pertenece
 * a una o más organizaciones.
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Identidad corporativa
  name: text('name').notNull(), // "Clínica Dental Pérez"
  slug: text('slug').notNull().unique(), // "clinica-dental-perez" (URL amigable)
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  slugIdx: index('idx_organizations_slug').on(table.slug),
}));

/**
 * Members Table
 * @description Tabla pivote que conecta Users con Organizations (Many-to-Many)
 * @created 2025-12-22 - Permite múltiples usuarios por organización
 * 
 * Roles:
 * - owner: Propietario (puede modificar facturación y suscripción)
 * - admin: Administrador (gestión completa sin facturación)
 * - member: Miembro (acceso limitado a funcionalidades)
 * 
 * Caso de uso:
 * - Un dueño de clínica dental (owner) invita a su secretaria (admin)
 * - Ambos acceden a la misma org, pero solo el owner toca facturación
 */
export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Relaciones
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Rol dentro de la organización
  role: memberRoleEnum('role').notNull().default('member'),
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // Constraint: Un usuario no puede tener múltiples roles en la misma org
  uniqueOrgUser: index('idx_members_org_user_unique').on(
    table.organizationId,
    table.userId
  ),
  // Índice para queries: "Buscar todos los miembros de org X"
  orgIdIdx: index('idx_members_org_id').on(table.organizationId),
  // Índice para queries: "Buscar todas las orgs del usuario Y"
  userIdIdx: index('idx_members_user_id').on(table.userId),
  // RBAC: Índice para queries por rol (ej: buscar todos los owners)
  roleIdx: index('idx_members_role').on(table.role),
  // RBAC: Índice compuesto para "todos los owners de org X" (alta performance)
  orgRoleIdx: index('idx_members_org_role').on(table.organizationId, table.role),
  // RBAC: Índice compuesto para "todas las orgs donde soy owner"
  userRoleIdx: index('idx_members_user_role').on(table.userId, table.role),
}));



/**
 * Users Demo Table
 * @description Registro de usuarios que solicitan demo pública
 */
export const usersDemo = pgTable('users_demo', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  industry: industrySectorEnum('industry').notNull(),
  ipAddress: text('ip_address').notNull(),
  retellCallId: text('retell_call_id'), // Nullable hasta que Retell responda
  durationCall: integer('duration_call').default(0), // Se actualizará vía webhook futuro
  
  // Verificación por email (añadido 30/11/2025)
  status: text('status').notNull().default('pending_verification'), // 'pending_verification' | 'verified' | 'call_triggered' | 'email_failed' | 'call_failed'
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verificationType: text('verification_type').default('email_otp'), // Para futuras expansiones
  
  // Nuevo campo para grado de satisfacción
  satisfaction: integer('satisfaction').default(0).notNull(),
  
  // Tracking de origen de tráfico (añadido 21/12/2025)
  resourceOrigin: text('resource_origin'), // UTM source (ej: "google", "x.com", "facebook")
  
  // Marketing Intelligence (B2B - añadido 22/12/2025)
  utmCampaign: text('utm_campaign'), // Campaña de marketing
  utmMedium: text('utm_medium'),     // Medio (cpc, email, social)
  
  // Conversión a Organización (B2B - añadido 22/12/2025)
  convertedOrgId: uuid('converted_org_id').references(() => organizations.id),
  
  // Datos post-llamada (actualizados vía webhook de Retell - 21/12/2025)
  scoreSentiment: text('score_sentiment'), // Análisis de sentimiento: "positive" | "negative" | "neutral"
  urlRecord: text('url_record'), // URL de la grabación de audio
  retellData: jsonb('retell_data'), // Payload completo de Retell (call_analysis, transcript, latency, etc.)
  
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // Índices para queries de verificación
  statusIdx: index('idx_users_demo_status').on(table.status),
  emailStatusIdx: index('idx_users_demo_email_status').on(table.email, table.status),
  // Índice para análisis de conversión por origen
  resourceOriginIdx: index('idx_users_demo_resource_origin').on(table.resourceOrigin),
}));

/**
 * IP Trials Table
 * @description Control de anti-abuse por IP - Limita trials por dirección IP
 * CORREGIDO: 2025-12-09 - Estructura anterior era incorrecta (copia de subscriptions)
 */
export const ipTrials = pgTable('ip_trials', {
  ipAddress: text('ip_address').primaryKey(),
  trialCount: integer('trial_count').notNull().default(0),
  blockedAt: timestamp('blocked_at', { withTimezone: true }),
  blockedReason: text('blocked_reason'),
  lastTrialAt: timestamp('last_trial_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  blockedIdx: index('idx_ip_trials_blocked').on(table.ipAddress),
}));

/**
 * Assigned Numbers Table
 * @description Pool de números virtuales de Zadarma contratados por Onucall
 * 
 * Flujo:
 * 1. Onucall compra N números a Zadarma (status='available', user_id=NULL)
 * 2. Cliente invited → admin: Selecciona número (status='assigned', user_id=cliente)
 * 3. Número eliminado del pool disponible
 * 
 * Fuente de verdad: Esta tabla (phone-options.ts es solo para UI de onboarding)
 * 
 * @created 2025-12-12 - Sistema de asignación de números Zadarma
 */
export const assignedNumbers = pgTable('assigned_numbers', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Número de teléfono (sin formato para APIs, ej: +34919930992)
  phoneNumber: text('phone_number').notNull().unique(),
  
  // Número formateado para UI (ej: +34 919 930 992)
  phoneNumberFormatted: text('phone_number_formatted').notNull(),
  
  // Prefijo internacional
  prefix: text('prefix').notNull().default('+34'),
  
  // Ubicación geográfica (Madrid, Barcelona, Sevilla, Valencia)
  location: text('location').notNull(),
  
  // Usuario asignado (NULL = disponible) - LEGACY: mantener por compatibilidad
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // B2B: Número asignado a organización (nueva columna - 22/12/2025)
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  
  // Fecha de asignación
  assignedAt: timestamp('assigned_at', { withTimezone: true }),
  
  // Estado del número: 'available' | 'assigned' | 'suspended'
  // - available: Disponible para asignar
  // - assigned: Asignado a un cliente
  // - suspended: Temporalmente deshabilitado (no disponible ni asignado)
  status: text('status').notNull().default('available'),
  
  // ID interno de Zadarma (para integración futura con API)
  zadarmaId: text('zadarma_id'),
  
  // Fecha de compra del número a Zadarma
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
  
  // Auditoría
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Índice para buscar números de un usuario específico
  userIdIdx: index('idx_assigned_numbers_user_id').on(table.userId),
  
  // Índice para filtrar por estado (queries de números disponibles)
  statusIdx: index('idx_assigned_numbers_status').on(table.status),
}));

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================
// NOTA: Tablas eliminadas temporalmente (implementación futura Fase 5)
// - billing_profiles
// - subscriptions  
// - invoices
// Cuando se implementen, seguirán el patrón B2B (FK a organizations)

// ============================================================================
// AGENT PROFILES (Onboarding Data - Simplified)
// ============================================================================

/**
 * Agent Profiles Table (Simplified)
 * @description Configuración del agente de IA por usuario (1:1 con users)
 * 
 * ESTRUCTURA SIMPLIFICADA (12 campos en 3 pasos):
 * - Paso 1: Identidad Corporativa (4 campos)
 * - Paso 2: Configuración del Agente (4 campos)
 * - Paso 3: Personalidad y Voz (4 campos)
 * 
 * RAZÓN: "Al usuario inicial hay que ponérselo fácil"
 */
export const agentProfiles = pgTable('agent_profiles', {
  // PK/FK - Relación 1:1 con users (LEGACY: mantener por compatibilidad)
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // B2B: Agente pertenece a la organización (añadido 22/12/2025)
  organizationId: uuid('organization_id').references(() => organizations.id),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 1: Identidad Corporativa
  // Objetivo: Definir quién habla y establecer el "Grounding" de la IA
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Nombre comercial: "Hola, has llamado a [Nombre Comercial]"
  businessName: text('business_name').notNull(),
  
  // Email para notificaciones técnicas del sistema
  notificationEmail: text('notification_email').notNull(),
  
  // Sitio web: Para futura capacidad de scraping (opcional)
  website: text('website'),
  
  // Teléfono de desvío (handoff): Vital para transferencias
  handoffPhone: text('handoff_phone').notNull(),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 2: Configuración del Agente
  // Objetivo: Personalizar el comportamiento según el sector
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Sector del negocio (determina plantillas y defaults)
  industry: industrySectorEnum('industry').notNull(),
  
  // Teléfono agéntico: El número que usará Retell AI para las llamadas
  // Por ahora se elige de una lista predefinida, luego se comprará vía Zadarma
  agentPhone: text('agent_phone').notNull(),
  
  // Descripción breve del negocio (máx 500 caracteres)
  businessDescription: text('business_description').notNull(),
  
  // Email para notificaciones de leads generados
  leadsEmail: text('leads_email').notNull(),
  
  // Política de transferencia: cuándo/cómo transferir a humano (máx 200 chars)
  transferPolicy: text('transfer_policy'),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 3: Personalidad y Voz
  // Objetivo: Definir cómo "suena" y se "siente" la marca
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Género del asistente: determina la voz (masculino/femenino)
  assistantGender: assistantGenderEnum('assistant_gender').notNull().default('female'),
  
  // Nombre del asistente: "Hola, soy [Nombre]..."
  assistantName: text('assistant_name').notNull().default('Asistente'),
  
  // Grado de amabilidad (1-10): modula la cortesía en las respuestas
  friendlinessLevel: integer('friendliness_level').notNull().default(3),
  
  // Grado de simpatía (1-10): modula la calidez y cercanía
  warmthLevel: integer('warmth_level').notNull().default(3),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Metadata
  // ═══════════════════════════════════════════════════════════════════════════
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  industryIdx: index('idx_agent_profiles_industry').on(table.industry),
}));

/**
 * Pending Invitations Table
 * @description Invitaciones pendientes para unirse a organizaciones
 * @created 2025-12-24 - Sistema de invitaciones B2B
 * 
 * Flujo de invitación:
 * 1. Owner/Admin crea invitación (genera token único de 64 chars)
 * 2. Se envía email con link: /accept-invite/[token]
 * 3. Usuario acepta → se crea registro en members + status='accepted'
 * 4. Token expira en 7 días por defecto
 * 
 * CONSTRAINT: Un email solo puede tener 1 invitación pendiente por organización
 */
export const pendingInvitations = pgTable('pending_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Relaciones
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: memberRoleEnum('role').notNull().default('member'),
  
  // Auditoría: quién invitó
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  
  // Token de seguridad (64 caracteres hexadecimales)
  // Generado con crypto.randomBytes(32).toString('hex')
  token: text('token').notNull().unique(),
  
  // Estado de la invitación
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'expired' | 'cancelled'
  
  // Expiración (7 días por defecto desde creación)
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
}, (table) => ({
  emailIdx: index('idx_pending_invitations_email').on(table.email),
  tokenIdx: index('idx_pending_invitations_token').on(table.token),
  statusIdx: index('idx_pending_invitations_status').on(table.status),
  // CONSTRAINT: Un email solo puede tener 1 invitación pendiente por org
  uniqueEmailOrg: index('idx_pending_invitations_email_org_unique').on(
    table.email,
    table.organizationId
  ),
}));

// ============================================================================
// RELATIONS (B2B Multi-Tenant Architecture)
// ============================================================================

// Organización: núcleo del modelo B2B
export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  members: many(members),
  pendingInvitations: many(pendingInvitations), // NUEVO: Invitaciones pendientes
  agentProfile: one(agentProfiles, {
    fields: [organizations.id],
    references: [agentProfiles.organizationId],
  }),
  assignedNumbers: many(assignedNumbers),
}));

// Members: tabla pivote User <-> Organization
export const membersRelations = relations(members, ({ one }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));

// Users: ACTUALIZADO para incluir memberships (B2B Multi-Tenant)
export const usersRelations = relations(users, ({ many, one }) => ({
  memberships: many(members), // Organizaciones del usuario
  sentInvitations: many(pendingInvitations, { relationName: 'inviter' }), // NUEVO: Invitaciones enviadas
  agentProfile: one(agentProfiles),
  assignedNumber: one(assignedNumbers),
}));



// ACTUALIZADO: Agent Profiles con organización
export const agentProfilesRelations = relations(agentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [agentProfiles.userId],
    references: [users.id],
  }),
  organization: one(organizations, { // NUEVO
    fields: [agentProfiles.organizationId],
    references: [organizations.id],
  }),
}));

// ACTUALIZADO: Assigned Numbers con organización
export const assignedNumbersRelations = relations(assignedNumbers, ({ one }) => ({
  user: one(users, {
    fields: [assignedNumbers.userId],
    references: [users.id],
  }),
  organization: one(organizations, { // NUEVO
    fields: [assignedNumbers.organizationId],
    references: [organizations.id],
  }),
}));

// Pending Invitations: relación con organización e inviter
export const pendingInvitationsRelations = relations(pendingInvitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [pendingInvitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [pendingInvitations.invitedBy],
    references: [users.id],
    relationName: 'inviter',
  }),
}));

// ============================================================================
// TYPES (Inferidos del schema)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserDemo = typeof usersDemo.$inferSelect;
export type NewUserDemo = typeof usersDemo.$inferInsert;

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type NewAgentProfile = typeof agentProfiles.$inferInsert;

export type IpTrial = typeof ipTrials.$inferSelect;
export type NewIpTrial = typeof ipTrials.$inferInsert;

export type AssignedNumber = typeof assignedNumbers.$inferSelect;
export type NewAssignedNumber = typeof assignedNumbers.$inferInsert;

// ═══ B2B Types (añadido 22/12/2025) ═══
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type PendingInvitation = typeof pendingInvitations.$inferSelect;
export type NewPendingInvitation = typeof pendingInvitations.$inferInsert;

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type IndustrySector = (typeof industrySectorEnum.enumValues)[number];
export type AssistantGender = (typeof assistantGenderEnum.enumValues)[number];
export type MemberRole = (typeof memberRoleEnum.enumValues)[number];
