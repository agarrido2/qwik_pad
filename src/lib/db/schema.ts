/**
 * Drizzle ORM Schema - Onucall SaaS
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
 */

import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, unique, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
  sector: text('sector'), // concesionario | inmobiliaria | clinica | sector personalizado
  businessDescription: text('business_description'), // Descripción del negocio
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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
  color: text('color').notNull(),
  slug: text('slug').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueOrgSlug: unique().on(table.organizationId, table.slug),
  orgIdx: index('idx_departments_org').on(table.organizationId),
  orgActiveIdx: index('idx_departments_org_active').on(table.organizationId, table.isActive),
}));

// ==========================================
// TABLA: call_flow_templates (Plantillas de Flujo)
// ==========================================

export const callFlowTemplates = pgTable('call_flow_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Slug del sector (concesionario, inmobiliaria, etc.) - alineado con constantes del código
  sector: text('sector'),
  
  name: text('name').notNull(),
  description: text('description'),
  
  // Configuración del flujo (steps, conditions, etc.)
  flowConfig: jsonb('flow_config').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// TABLA: users_demo (Demo público)
// ==========================================

/**
 * Users Demo Table
 * @description Registro de usuarios que solicitan demo pública
 * Flujo: Formulario → Email OTP → Llamada Retell → Post-call analytics
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
 * Casos de uso:
 * - Clínica: Agente "Recepción", Agente "Urgencias 24h", Agente "Seguimiento"
 * - Concesionario: Agente "Nuevo", Agente "Ocasión", Agente "Taller"
 */
export const voiceAgents = pgTable('voice_agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Propiedad (relación N:1 con organizations)
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Identidad del Agente
  name: text('name').notNull(), // "Recepción Clínica", "Agente Urgencias 24h"
  description: text('description'), // Descripción interna del propósito
  sector: text('sector'), // concesionario | inmobiliaria | clinica | custom
  
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

export const departmentsRelations = relations(departments, ({ one }) => ({
  /** Organización propietaria del departamento */
  organization: one(organizations, {
    fields: [departments.organizationId],
    references: [organizations.id],
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

// Type helpers para enums
export type AssistantGender = (typeof assistantGenderEnum.enumValues)[number];
export type SubscriptionTier = (typeof subscriptionTierEnum.enumValues)[number];
export type PhoneNumberStatus = (typeof phoneNumberStatusEnum.enumValues)[number];
