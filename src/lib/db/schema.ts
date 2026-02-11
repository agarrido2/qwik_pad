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

import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, unique, integer } from 'drizzle-orm/pg-core';

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
});

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
