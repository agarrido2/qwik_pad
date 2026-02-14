/**
 * Drizzle ORM Schema - Onucall SaaS
 * 
 * Arquitectura Multi-Tenant N:M:
 * - Users pueden pertenecer a múltiples Organizations (consultores, franquicias)
 * - Organizations pueden tener múltiples Users con roles diferentes
 * 
 * Free Tier Strategy:
 * - subscription_tier = 'free' → Preview mode, datos demo generados en onboarding
 * - zadarme_phone_number y retell_agent_id son NULL en free tier
 * 
 * Basado en: docs/plans/FASE_01_AUTH_LANDING_V2.md
 */

import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, unique, integer, index } from 'drizzle-orm/pg-core';

// ==========================================
// ENUMS
// ==========================================

/**
 * Sectores verticales de Onucall (5 sectores)
 * @description Usado en onboarding y demo para determinar plantillas y agentes
 */
export const industrySectorEnum = pgEnum('industry_sector', [
  'concesionario',    // Concesionarios de Vehículos
  'inmobiliaria',     // Inmobiliarias
  'retail',           // Retail y Distribución
  'alquiladora',      // Empresas Alquiladoras
  'sat',              // Servicios Técnicos (SAT)
]);

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
  
  // Integraciones (NULL en free tier)
  zadarmePhoneNumber: text('zadarme_phone_number'), // +34919930992
  retellAgentId: text('retell_agent_id'),           // UUID de Retell AI
  
  // Metadata de negocio (Onboarding Paso 2)
  industry: text('industry'), // concesionario | inmobiliaria | clinica | ...
  businessDescription: text('business_description'), // Descripción del negocio
  
  // Configuración del Asistente (Onboarding Paso 3)
  assistantName: text('assistant_name'), // Nombre del asistente de voz
  assistantGender: assistantGenderEnum('assistant_gender'), // Género del asistente
  assistantKindnessLevel: integer('assistant_kindness_level'), // 1-5
  assistantFriendlinessLevel: integer('assistant_friendliness_level'), // 1-5
  
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
// TABLA: industry_types (Catálogo de Sectores)
// ==========================================

export const industryTypes = pgTable('industry_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  slug: text('slug').notNull().unique(), // concesionario, inmobiliaria, clinica
  name: text('name').notNull(),          // "Concesionario de Vehículos"
  description: text('description'),
  icon: text('icon'),                    // Emoji: 🚗, 🏠, 🏥
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// TABLA: call_flow_templates (Plantillas de Flujo)
// ==========================================

export const callFlowTemplates = pgTable('call_flow_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Relación con sector
  industryTypeId: uuid('industry_type_id').references(() => industryTypes.id),
  
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
  industry: industrySectorEnum('industry').notNull(),
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
// TABLA: agent_profiles (Configuración IA)
// ==========================================

/**
 * Agent Profiles Table
 * @description Configuración del agente de IA por usuario (1:1 con users)
 * Estructura: 12 campos en 3 pasos de onboarding
 */
export const agentProfiles = pgTable('agent_profiles', {
  // PK/FK - Relación 1:1 con users
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // B2B: Agente pertenece a la organización
  organizationId: uuid('organization_id').references(() => organizations.id),
  
  // PASO 1: Identidad Corporativa
  businessName: text('business_name').notNull(),
  notificationEmail: text('notification_email').notNull(),
  website: text('website'),
  handoffPhone: text('handoff_phone').notNull(),
  
  // PASO 2: Configuración del Agente
  industry: industrySectorEnum('industry').notNull(),
  agentPhone: text('agent_phone').notNull(),
  businessDescription: text('business_description').notNull(),
  leadsEmail: text('leads_email').notNull(),
  transferPolicy: text('transfer_policy'),
  
  // PASO 3: Personalidad y Voz
  assistantGender: assistantGenderEnum('assistant_gender').notNull().default('female'),
  assistantName: text('assistant_name').notNull().default('Asistente'),
  friendlinessLevel: integer('friendliness_level').notNull().default(3),
  warmthLevel: integer('warmth_level').notNull().default(3),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  industryIdx: index('idx_agent_profiles_industry').on(table.industry),
}));

// ==========================================
// TABLA: assigned_numbers (Pool Zadarma)
// ==========================================

/**
 * Assigned Numbers Table
 * @description Pool de números virtuales de Zadarma contratados por Onucall
 * Status: 'available' | 'assigned' | 'suspended'
 */
export const assignedNumbers = pgTable('assigned_numbers', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  phoneNumber: text('phone_number').notNull().unique(),
  phoneNumberFormatted: text('phone_number_formatted').notNull(),
  prefix: text('prefix').notNull().default('+34'),
  location: text('location').notNull(),
  
  // Usuario asignado (LEGACY: mantener compatibilidad)
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // B2B: Número asignado a organización
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  
  assignedAt: timestamp('assigned_at', { withTimezone: true }),
  status: text('status').notNull().default('available'),
  zadarmaId: text('zadarma_id'),
  purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_assigned_numbers_user_id').on(table.userId),
  statusIdx: index('idx_assigned_numbers_status').on(table.status),
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

export type IndustryType = typeof industryTypes.$inferSelect;
export type NewIndustryType = typeof industryTypes.$inferInsert;

export type CallFlowTemplate = typeof callFlowTemplates.$inferSelect;
export type NewCallFlowTemplate = typeof callFlowTemplates.$inferInsert;

export type UserDemo = typeof usersDemo.$inferSelect;
export type NewUserDemo = typeof usersDemo.$inferInsert;

export type IpTrial = typeof ipTrials.$inferSelect;
export type NewIpTrial = typeof ipTrials.$inferInsert;

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type NewAgentProfile = typeof agentProfiles.$inferInsert;

export type AssignedNumber = typeof assignedNumbers.$inferSelect;
export type NewAssignedNumber = typeof assignedNumbers.$inferInsert;

// Type helpers para enums
export type IndustrySector = (typeof industrySectorEnum.enumValues)[number];
export type AssistantGender = (typeof assistantGenderEnum.enumValues)[number];
export type SubscriptionTier = (typeof subscriptionTierEnum.enumValues)[number];
