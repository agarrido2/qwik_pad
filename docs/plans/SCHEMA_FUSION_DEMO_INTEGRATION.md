# Plan: Fusión de Schema + Integración de Demo Feature

**Fecha:** 13 de febrero de 2026  
**Arquitecto:** QwikArchitect  
**Estado:** 🔄 Pendiente de Aprobación

---

## 📋 Índice
- [Contexto](#contexto)
- [Análisis de Cambios Realizados](#análisis-de-cambios-realizados)
- [Discrepancias Críticas](#discrepancias-críticas)
- [Arquitectura Propuesta](#arquitectura-propuesta)
- [Plan de Migración (Base de Datos)](#plan-de-migración-base-de-datos)
- [Plan de Integración (Landing Page)](#plan-de-integración-landing-page)
- [Auditoría de Features/Onboarding](#auditoría-de-featuresonboarding)
- [Checklist de Implementación](#checklist-de-implementación)
- [Riesgos y Mitigación](#riesgos-y-mitigación)

---

## Contexto

El usuario ha realizado importantes modificaciones arquitectónicas:

1. ✅ **Creada `src/features/demo/`** - Feature completa con 2-step verification flow
2. ✅ **Modificado `lib/db/`** - Añadido `schema-fusion.ts` como modelo de referencia
3. ⚠️ **Schema desincronizado** - `schema.ts` actual vs `schema-fusion.ts` (modelo)
4. 🔍 **Landing página necesita integración** - Formulario estático → DemoWidget dinámico

### Objetivos del Plan

1. **Fusionar schemas** sin pérdida de datos
2. **Integrar DemoWidget** en la landing page (sección #live-demo)
3. **Validar features/onboarding** contra el nuevo schema
4. **Mantener arquitectura canónica** según `ARQUITECTURA_FOLDER.md`

---

## Análisis de Cambios Realizados

### ✅ 1. `src/features/demo/` (Nueva Feature)

**Estructura:**
```
src/features/demo/
├── components/
│   ├── DemoWidget.tsx          # Form + 2-step verification flow
│   ├── VerificationModal.tsx   # Modal para código OTP
│   └── index.ts
├── data/
│   └── agents.ts               # Mapeo sectores → Retell agent IDs
├── schemas/
│   ├── demo.schema.ts          # Zod validation (DemoFormInput)
│   └── verification.schema.ts  # Zod validation (VerifyCodeInput)
├── services/
│   ├── demo.services.ts        # Lógica de negocio (rate-limit, DB insert)
│   └── verification.service.ts # Generación/validación OTP
├── types/
│   └── demo.types.ts
└── index.ts
```

**Cumplimiento Arquitectónico:** ✅ CORRECTO
- Sigue patrón de features aisladas
- Servicios en `services/` (no en rutas)
- Schemas Zod en `schemas/`
- Componentes puros en `components/`

---

### ⚠️ 2. `lib/db/schema-fusion.ts` vs `schema.ts`

**`schema-fusion.ts`** es el modelo **SUPERIOR** con:

#### Tablas Nuevas:
- ✅ `usersDemo` - Demo requests con UTM tracking, conversión, verificación
- ✅ `ipTrials` - Anti-abuse por IP
- ✅ `assignedNumbers` - Pool de números Zadarma
- ✅ `agentProfiles` - Configuración del agente IA (12 campos, 3 pasos)
- ✅ `pendingInvitations` - Sistema de invitaciones B2B
- ✅ `industryTypes` - Catálogo de sectores (futuro)
- ✅ `callFlowTemplates` - Templates por sector (futuro)

#### Mejoras Sustanciales:
- ✅ `members` (reemplaza `organizationMembers` - nomenclatura estándar)
- ✅ `industrySectorEnum` - Enum específico (`concesionario`, `inmobiliaria`, etc.)
- ✅ Mejores índices y constraints
- ✅ Relaciones Drizzle con `relations()`
- ✅ Documentación inline completa

**`schema.ts`** es el schema **ACTUAL** (base de datos en producción):
- ⚠️ Falta tabla `usersDemo`
- ⚠️ Falta tabla `ipTrials` 
- ⚠️ Falta tabla `assignedNumbers`
- ⚠️ Falta tabla `agentProfiles`
- ⚠️ Falta tabla `pendingInvitations`
- ⚠️ Usa `organizationMembers` (debería ser `members`)
- ⚠️ No tiene `industrySectorEnum`

---

## Discrepancias Críticas

### 🔴 CRÍTICA 1: Nomenclatura de Tablas

| Schema Fusion (Modelo) | Schema Actual | Impacto |
|------------------------|---------------|---------|
| `members` | `organizationMembers` | 🔴 BREAKING - Toda lógica de membresía |
| `usersDemo` | ❌ No existe | 🔴 BLOCKER - Feature demo no funciona |
| `agentProfiles` | ❌ No existe | 🟡 MEDIUM - Onboarding sin tabla destino |

### 🔴 CRÍTICA 2: Enums Incompatibles

**Schema Fusion (Modelo):**
```typescript
export const industrySectorEnum = pgEnum('industry_sector', [
  'concesionario',
  'inmobiliaria',
  'retail',
  'alquiladora',
  'sat',
]);
```

**Schema Actual:**
```typescript
// No existe industrySectorEnum
// Solo usa text('industry') sin validación a nivel de DB
```

**Impacto:**
- 🔴 `features/demo/` espera el enum `industrySectorEnum`
- 🔴 `features/onboarding/` usa valores hardcoded que deben coincidir

### 🔴 CRÍTICA 3: Tabla `usersDemo` No Existe

**La feature `demo/` necesita esta tabla AHORA:**

```typescript
// src/features/demo/services/demo.services.ts (línea 72)
const [demoRecord] = await db
  .insert(usersDemo)  // ❌ ERROR: usersDemo no existe en schema.ts
  .values({ ... })
```

---

## Arquitectura Propuesta

### Estrategia: Migración Incremental No-Destructiva

**Principio:** No eliminar `schema.ts`, sino actualizarlo progresivamente desde `schema-fusion.ts`.

#### Fase 1: Tablas Críticas (BLOQUEANTES)
1. ✅ Añadir tabla `usersDemo` (requerida por `features/demo/`)
2. ✅ Añadir tabla `ipTrials` (anti-abuse para demo)
3. ✅ Añadir enum `industrySectorEnum`

#### Fase 2: Tablas de Onboarding
4. ✅ Añadir tabla `agentProfiles` (destino de onboarding)
5. ✅ Añadir tabla `assignedNumbers` (pool de números)

#### Fase 3: Rename Breaking Change
6. ⚠️ **CUIDADO:** Renombrar `organizationMembers` → `members`
   - Requiere migración de datos
   - Actualizar todos los servicios que referencian `organizationMembers`

#### Fase 4: Features Opcionales (Futuras)
7. ⏸️ `pendingInvitations` (sistema de invitaciones B2B)
8. ⏸️ `industryTypes` (catálogo de sectores)
9. ⏸️ `callFlowTemplates` (templates por sector)

---

## Plan de Migración (Base de Datos)

**Agente Responsable:** 🗄️ **QwikDBA**

### Tarea 1: Análisis Pre-Migración
- [ ] Comparar `schema.ts` vs `schema-fusion.ts` línea por línea
- [ ] Identificar tablas con datos existentes (`users`, `organizations`, `organizationMembers`)
- [ ] Verificar relaciones FK que puedan romperse

### Tarea 2: Crear Enums Nuevos
```typescript
// Añadir a schema.ts (antes de las tablas)
export const industrySectorEnum = pgEnum('industry_sector', [
  'concesionario',
  'inmobiliaria',
  'retail',
  'alquiladora',
  'sat',
]);

export const assistantGenderEnum = pgEnum('assistant_gender', [
  'male',
  'female'
]);
```

### Tarea 3: Añadir Tabla `usersDemo` (CRÍTICA)
```typescript
// Copiar de schema-fusion.ts líneas 202-251
export const usersDemo = pgTable('users_demo', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  industry: industrySectorEnum('industry').notNull(),
  ipAddress: text('ip_address').notNull(),
  retellCallId: text('retell_call_id'),
  durationCall: integer('duration_call').default(0),
  status: text('status').notNull().default('pending_verification'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verificationType: text('verification_type').default('email_otp'),
  satisfaction: integer('satisfaction').default(0).notNull(),
  resourceOrigin: text('resource_origin'),
  utmCampaign: text('utm_campaign'),
  utmMedium: text('utm_medium'),
  convertedOrgId: uuid('converted_org_id').references(() => organizations.id),
  scoreSentiment: text('score_sentiment'),
  urlRecord: text('url_record'),
  retellData: jsonb('retell_data'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('idx_users_demo_status').on(table.status),
  emailStatusIdx: index('idx_users_demo_email_status').on(table.email, table.status),
  resourceOriginIdx: index('idx_users_demo_resource_origin').on(table.resourceOrigin),
}));
```

### Tarea 4: Añadir Tabla `ipTrials` (Anti-Abuse)
```typescript
// Copiar de schema-fusion.ts líneas 253-267
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
```

### Tarea 5: Añadir Tabla `agentProfiles`
```typescript
// Copiar de schema-fusion.ts líneas 348-429
// NOTA: Esta tabla es el destino del onboarding (12 campos en 3 pasos)
export const agentProfiles = pgTable('agent_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
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
```

### Tarea 6: Añadir Tabla `assignedNumbers`
```typescript
// Copiar de schema-fusion.ts líneas 269-346
export const assignedNumbers = pgTable('assigned_numbers', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: text('phone_number').notNull().unique(),
  phoneNumberFormatted: text('phone_number_formatted').notNull(),
  prefix: text('prefix').notNull().default('+34'),
  location: text('location').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
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
```

### Tarea 7: Generar y Aplicar Migración
```bash
# 1. Generar migración SQL
bun run db:generate

# 2. Revisar archivo generado en drizzle/XXXX_add_demo_tables.sql
# 3. Si todo OK, aplicar a base de datos
bun run db:push
```

### Tarea 8: Validar Migración
```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users_demo', 'ip_trials', 'agent_profiles', 'assigned_numbers');

-- Verificar enum creado
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'industry_sector'::regtype;
```

### ⚠️ Tarea 9 (FUTURO): Rename `organizationMembers` → `members`

**ADVERTENCIA:** Cambio BREAKING que requiere:
1. Backup completo de la BD antes de ejecutar
2. Migración de datos de `organization_members` → `members`
3. Actualización de todos los servicios en `lib/services/` que referencian:
   - `organizationMembers.insert()`
   - `organizationMembers.select()`
   - etc.
4. Actualización de tipos TypeScript exportados

**Recomendación:** Dejar para **Fase 2** después de validar el resto.

---

## Plan de Integración (Landing Page)

**Agente Responsable:** 🏗️ **QwikBuilder**

### Análisis Actual

**Ubicación:** [src/routes/(public)/index.tsx](src/routes/(public)/index.tsx#L101-L240)

```tsx
{/* Live Demo Section - ACTUAL: Formulario estático */}
<section id="live-demo" class="bg-linear-to-br from-primary-50 to-white py-20">
  {/* Grid 2 columnas: Sectores (left) + Formulario estático (right) */}
  <form class="space-y-4">
    {/* Campos HTML puros sin validación */}
  </form>
</section>
```

### Arquitectura Propuesta

**ANTES:** Formulario HTML estático (sin funcionalidad)

**DESPUÉS:** Integración completa con `DemoWidget` de `features/demo/`

#### Patrón Orchestrator (Ruta como Director)

El archivo [src/routes/(public)/index.tsx](src/routes/(public)/index.tsx) debe:

1. **Importar Actions** desde `features/demo/services/`
2. **Crear `routeAction$`** para orquestar
3. **Pasar ActionStores** a `DemoWidget` component

### Tarea 1: Crear Route Actions (Orquestación)

**Archivo:** [src/routes/(public)/index.tsx](src/routes/(public)/index.tsx)

**Añadir al inicio del archivo (antes de `component$`):**

```typescript
import { routeAction$, zod$ } from '@builder.io/qwik-city';
import { DemoWidget } from '~/features/demo/components/DemoWidget';
import { demoFormSchema } from '~/features/demo/schemas/demo.schema';
import { verificationCodeSchema } from '~/features/demo/schemas/verification.schema';
import { requestDemoVerification, verifyDemoCode } from '~/features/demo/services/demo.services';

/**
 * Action: Step 1 - Solicitar código de verificación
 * @description Orquesta el servicio requestDemoVerification
 */
export const useDemoRequestAction = routeAction$(
  async (data, requestEvent) => {
    const ipAddress = requestEvent.headers.get('x-forwarded-for') || 
                      requestEvent.headers.get('x-real-ip') || 
                      'unknown';

    const result = await requestDemoVerification(requestEvent, data, ipAddress);

    if (!result.success) {
      return requestEvent.fail(400, {
        message: result.error || 'Error al procesar la solicitud',
      });
    }

    return { success: true, email: data.email };
  },
  zod$(demoFormSchema)
);

/**
 * Action: Step 2 - Verificar código OTP
 * @description Orquesta el servicio verifyDemoCode
 */
export const useVerifyCodeAction = routeAction$(
  async (data, requestEvent) => {
    const result = await verifyDemoCode(requestEvent, data);

    if (!result.success) {
      return requestEvent.fail(400, {
        message: result.error || 'Código inválido',
      });
    }

    return { success: true };
  },
  zod$(verificationCodeSchema)
);
```

### Tarea 2: Reemplazar Formulario Estático

**Ubicación:** [src/routes/(public)/index.tsx](src/routes/(public)/index.tsx#L101-L240)

**REEMPLAZAR:**
```tsx
{/* Live Demo Section */}
<section id="live-demo" class="bg-linear-to-br from-primary-50 to-white py-20">
  <div class="content-container">
    {/* Grid 2 columnas: Sectores + Formulario ESTÁTICO */}
    <div class="grid gap-8 lg:grid-cols-[2fr,1fr]">
      {/* Cards de sectores... */}
      
      {/* FORMULARIO ESTÁTICO - SIN FUNCIONALIDAD */}
      <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-md">
        <form class="space-y-4">
          {/* Campos HTML puros */}
        </form>
      </div>
    </div>
  </div>
</section>
```

**POR:**
```tsx
{/* Live Demo Section - ACTUALIZADO: DemoWidget funcional */}
<section id="live-demo" class="bg-linear-to-br from-primary-50 to-white py-20">
  <div class="content-container">
    
    {/* Hero */}
    <div class="mx-auto mb-12 max-w-2xl text-center">
      <h2 class="mb-4 text-3xl font-bold text-neutral-900 md:text-4xl">
        Prueba nuestro agente de IA ahora
      </h2>
      <p class="text-lg text-neutral-600">
        Descubre cómo tu negocio puede automatizar llamadas. Selecciona tu sector 
        y recibirás una llamada en menos de 30 segundos.
      </p>
    </div>

    {/* Grid 2 columnas: Sectores + DemoWidget */}
    <div class="grid gap-8 lg:grid-cols-[2fr,1fr]">
      
      {/* LEFT: Grid Bento de 5 Sectores */}
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[
          { id: 'concesionario', emoji: '🚗', name: 'Concesionarios', desc: 'Gestiona consultas de stock' },
          { id: 'inmobiliaria', emoji: '🏠', name: 'Inmobiliarias', desc: 'Atiende visitas a propiedades' },
          { id: 'retail', emoji: '🛒', name: 'Retail', desc: 'Informa sobre productos' },
          { id: 'alquiladora', emoji: '🚛', name: 'Alquiladoras', desc: 'Disponibilidad de maquinaria' },
          { id: 'sat', emoji: '🔧', name: 'SAT', desc: 'Recibe incidencias técnicas' },
        ].map((sector) => (
          <div key={sector.id} class="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg">
            <div class="flex h-28 items-center justify-center bg-linear-to-br from-primary-50 to-accent-50">
              <span class="text-4xl" aria-hidden="true">{sector.emoji}</span>
            </div>
            <div class="p-4">
              <h3 class="mb-1 text-sm font-semibold text-neutral-900">{sector.name}</h3>
              <p class="text-xs text-neutral-600">{sector.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: DemoWidget funcional con 2-step verification */}
      <DemoWidget 
        requestAction={demoRequestAction} 
        verifyAction={verifyCodeAction} 
      />
    </div>
  </div>
</section>
```

### Tarea 3: Actualizar Componente `DemoWidget` (Si Necesario)

**Archivo:** [src/features/demo/components/DemoWidget.tsx](src/features/demo/components/DemoWidget.tsx)

**Verificar:**
- ✅ Usa `Form` de Qwik City para integración con Actions
- ✅ Maneja estados `form`, `verification`, `success`
- ✅ Tracking UTM desde URL params (`useLocation()`)

**Ajuste Propuesto (si no existe):**

```typescript
import { useLocation } from '@builder.io/qwik-city';

export const DemoWidget = component$<DemoWidgetProps>(({ requestAction, verifyAction }) => {
  const location = useLocation();
  
  // Capturar UTM params de la URL
  const utmSource = location.url.searchParams.get('utm_source');
  const utmCampaign = location.url.searchParams.get('utm_campaign');
  const utmMedium = location.url.searchParams.get('utm_medium');
  
  return (
    <Form action={requestAction}>
      {/* Campos visibles... */}
      
      {/* Hidden inputs para UTM tracking */}
      {utmSource && <input type="hidden" name="resourceOrigin" value={utmSource} />}
      {utmCampaign && <input type="hidden" name="utmCampaign" value={utmCampaign} />}
      {utmMedium && <input type="hidden" name="utmMedium" value={utmMedium} />}
    </Form>
  );
});
```

---

## Auditoría de Features/Onboarding

**Agente Responsable:** 🏗️ **QwikBuilder** (después de migración de schema)

### Tarea 1: Verificar Schema de Onboarding

**Archivo:** [src/features/onboarding/schemas/onboarding.schemas.ts](src/features/onboarding/schemas/onboarding.schemas.ts)

**Estado Actual:**
```typescript
export const onboardingSchema = z.object({
  // PASO 1: Identidad
  fullName: z.string().min(1).max(50),
  businessName: z.string().min(1).max(100),
  phone: z.string().min(7).regex(/^[+]?[0-9\s-()]+$/),

  // PASO 2: Reglas de negocio
  industry: z.enum(['concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat']),
  businessDescription: z.string().min(20).max(500),

  // PASO 3: Su asistente
  assistantGender: z.enum(['male', 'female']),
  assistantName: z.string().min(1).max(50),
  friendlinessLevel: z.coerce.number().min(1).max(5),
  warmthLevel: z.coerce.number().min(1).max(5),
});

export const SECTORS = [
  { value: 'concesionario', label: 'Concesionario' },
  { value: 'inmobiliaria', label: 'Inmobiliaria' },
  { value: 'retail', label: 'Retail' },
  { value: 'alquiladora', label: 'Alquiladora de vehículos' },
  { value: 'sat', label: 'SAT' },
] as const;
```

**Análisis:**
- ✅ Sectores coinciden con `industrySectorEnum` de schema-fusion.ts
- ✅ Campos coinciden con tabla `agentProfiles` (12 campos, 3 pasos)
- ⚠️ **FALTA:** Campos adicionales de `agentProfiles`:
  - `notificationEmail`
  - `website`
  - `handoffPhone` (teléfono de desvío)
  - `agentPhone` (número virtual)
  - `leadsEmail`
  - `transferPolicy`

**Acción Requerida:** Ampliar schema de onboarding para incluir campos faltantes de `agentProfiles`.

### Tarea 2: Verificar Servicios de Onboarding

**Archivo:** [src/features/onboarding/services/index.ts](src/features/onboarding/services/index.ts)

**Verificar:**
- [ ] ¿Hacen `insert` en tabla `agentProfiles`? (si no existe, añadir)
- [ ] ¿Usan `industrySectorEnum` correctamente?
- [ ] ¿Actualizan `users.onboardingCompleted = true`?

### Tarea 3: Verificar Componentes de Onboarding

**Archivo:** [src/features/onboarding/components/industry-selector.tsx](src/features/onboarding/components/industry-selector.tsx)

**Verificar:**
- [ ] Labels de sectores coinciden con `SECTORS` de schema
- [ ] Emojis/iconos actualizados

---

## Checklist de Implementación

### 📊 **Fase 1: Migración de Schema** (QwikDBA)

- [ ] **Análisis de Normativa:** Revisar `docs/standards/ARQUITECTURA_FOLDER.md`
- [ ] **Verificación Técnica:** Validar compatibilidad con Drizzle ORM

#### Base de Datos (QwikDBA)
- [ ] Añadir enum `industrySectorEnum` a [lib/db/schema.ts](lib/db/schema.ts)
- [ ] Añadir enum `assistantGenderEnum` a [lib/db/schema.ts](lib/db/schema.ts)
- [ ] Añadir tabla `usersDemo` a [lib/db/schema.ts](lib/db/schema.ts)
- [ ] Añadir tabla `ipTrials` a [lib/db/schema.ts](lib/db/schema.ts)
- [ ] Añadir tabla `agentProfiles` a [lib/db/schema.ts](lib/db/schema.ts)
- [ ] Añadir tabla `assignedNumbers` a [lib/db/schema.ts](lib/db/schema.ts)
- [ ] Generar migración con `bun run db:generate`
- [ ] Revisar archivo SQL generado en `drizzle/XXXX_*.sql`
- [ ] Aplicar migración con `bun run db:push`
- [ ] Validar integridad de datos con queries SQL

### 🏗️ **Fase 2: Integración Landing** (QwikBuilder)

#### Lógica y Rutas
- [ ] Crear `useDemoRequestAction` en [routes/(public)/index.tsx](routes/(public)/index.tsx)
- [ ] Crear `useVerifyCodeAction` en [routes/(public)/index.tsx](routes/(public)/index.tsx)
- [ ] Importar `DemoWidget` desde `features/demo/`
- [ ] Reemplazar formulario estático por `<DemoWidget />`
- [ ] Actualizar grid de sectores (solo 5 sectores válidos)
- [ ] Añadir tracking UTM al DemoWidget

#### Componentes UI (Tailwind v4, Mobile-First)
- [ ] Verificar estilos de DemoWidget (responsive)
- [ ] Verificar estilos de VerificationModal
- [ ] Añadir estados de loading/error
- [ ] Testing manual en mobile/tablet/desktop

### 🔍 **Fase 3: Auditoría Onboarding** (QwikBuilder)

#### Validación de Schemas
- [ ] Ampliar [features/onboarding/schemas/onboarding.schemas.ts](features/onboarding/schemas/onboarding.schemas.ts) con campos faltantes
- [ ] Verificar coincidencia con tabla `agentProfiles`

#### Servicios
- [ ] Verificar que onboarding inserta en `agentProfiles` (no en `users`)
- [ ] Verificar uso de `industrySectorEnum`
- [ ] Actualizar `users.onboardingCompleted = true` al finalizar

#### Componentes
- [ ] Verificar `industry-selector.tsx` usa sectores correctos
- [ ] Verificar `onboarding-progress.tsx` muestra 3 pasos

---

## Riesgos y Mitigación

### 🔴 Riesgo 1: Pérdida de Datos en Migración

**Probabilidad:** BAJA  
**Impacto:** CRÍTICO

**Mitigación:**
1. ✅ Tablas nuevas (`usersDemo`, etc.) → Sin riesgo (no existen datos previos)
2. ⚠️ Rename `organizationMembers` → `members` → **ALTO RIESGO**
   - **Mitigación:** Dejar para Fase 2 (fuera de este plan)
   - Hacer backup completo de BD antes de ejecutar

### 🟡 Riesgo 2: Breaking Changes en Features Existentes

**Probabilidad:** MEDIA  
**Impacto:** MEDIO

**Casos:**
- Si `organizationMembers` se renombra a `members`, todos los servicios que lo usan se rompen

**Mitigación:**
1. **NO** renombrar `organizationMembers` en Fase 1
2. Añadir **alias** temporal en queries si es necesario
3. Documentar deuda técnica en [docs/plans/REFACTOR_MEMBERS_TABLE.md](docs/plans/REFACTOR_MEMBERS_TABLE.md) (futuro)

### 🟡 Riesgo 3: DemoWidget No Funcional Sin `usersDemo`

**Probabilidad:** ALTA (si no se ejecuta migración)  
**Impacto:** BLOCKER

**Mitigación:**
1. ✅ **Priorizar** creación de tabla `usersDemo` (Fase 1, Tarea 3)
2. No integrar DemoWidget en landing hasta validar que tabla existe
3. Test manual: Intentar insertar en `usersDemo` vía `bun run db:studio`

### 🟢 Riesgo 4: Incompatibilidad de Enums

**Probabilidad:** BAJA  
**Impacto:** BAJO

**Mitigación:**
1. ✅ Sectores de demo coinciden con sectores de onboarding
2. Validar con tipo TypeScript: `type IndustrySector = (typeof industrySectorEnum.enumValues)[number]`
3. Exportar desde schema.ts y reusar en features

---

## Orden de Ejecución

1. **QwikDBA** → Migración de schema (½ día)
2. **QwikBuilder** → Integración landing (½ día)
3. **QwikBuilder** → Auditoría onboarding (¼ día)
4. **QwikArchitect** (tú) → Review final y sign-off

---

## Aprobación

**Instrucción Final:** Si apruebas este plan, responde:

✅ **"Plan aprobado"**

Entonces pasaré el testigo a:
1. **QwikDBA** → Para ejecutar migración de schema
2. **QwikBuilder** → Para implementar integración de DemoWidget

---

**Nota:** El archivo `schema-fusion.ts` puede eliminarse **DESPUÉS** de completar la migración (será redundante).
