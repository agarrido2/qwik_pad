# Plan de Limpieza y Corrección — Post-Auditoría Completa

**Fecha:** 14 de febrero de 2026  
**Auditoría:** Análisis exhaustivo de 50+ archivos de aplicación  
**Objetivo:** Eliminar deuda técnica, resolver inconsistencias críticas, preparar base sólida para escalado

---

## RESUMEN EJECUTIVO

La aplicación tiene una arquitectura sólida (Orchestrator Pattern, 3-layer, RBAC) pero arrastra **~1.086 líneas de código muerto**, **esquemas duplicados**, y **inconsistencias de tipo**. Este plan prioriza acciones críticas que bloquean calidad y seguridad.

**Scorecard Global:**
- Arquitectura: 8/10 ✅
- Performance: 7/10 ✅
- Seguridad: 5/10 ⚠️
- Higiene: 4/10 ❌
- Consistencia: 4/10 ❌

---

## FASE 1: ELIMINACIÓN DE ARCHIVOS RESIDUALES (Inmediata)

### 🗑️ Archivos para ELIMINAR (Total: ~980 líneas)

| Archivo | Líneas | Razón |
|---------|--------|-------|
| `src/lib/db/schema-fusion.ts` | 596 | Schema alternativo nunca integrado. Nadie lo importa. |
| `src/lib/auth/rbac-examples.tsx` | 376 | Código de EJEMPLO en producción. Nadie lo importa. |
| `src/lib/supabase/client.browser.ts` | 8 | Cliente browser definido pero nunca usado. |

**Acción:**
```bash
rm src/lib/db/schema-fusion.ts
rm src/lib/auth/rbac-examples.tsx
rm src/lib/supabase/client.browser.ts
```

**Validación:** Ejecutar `bun run build && bun run lint` — debe pasar sin errores.

---

## FASE 2: LIMPIEZA DE CÓDIGO MUERTO INTERNO (Alta Prioridad)

### 📄 `src/lib/auth/rbac-loaders.ts`

**Eliminar 3 loaders sin uso:**

1. **`useUserRoleLoader`** (líneas 65-119, ~55 líneas)
   - Razón: Reemplazado por `usePermissions` (useComputed$)
   - Confirmación: Ningún import en el workspace

2. **`useBillingPermissionLoader`** (líneas 180-206, ~27 líneas)
   - Razón: Definido pero nunca importado
   - Alternativa: Usar `canAccessBilling` de guards.ts

3. **`useWritePermissionLoader`** (líneas 208-236, ~29 líneas)
   - Razón: Definido pero nunca importado
   - Alternativa: Usar `canWrite` de guards.ts

**Total a eliminar:** ~111 líneas

**Plan de refactor:**
```typescript
// ANTES (238 líneas)
export const useUserRoleLoader = routeLoader$(...);
export const useOrganizationMembersLoader = routeLoader$(...);
export const useBillingPermissionLoader = routeLoader$(...);
export const useWritePermissionLoader = routeLoader$(...);

// DESPUÉS (127 líneas)
export const useOrganizationMembersLoader = routeLoader$(...);
// Solo el loader que SÍ se usa (en usuarios/index.tsx)
```

---

## FASE 3: RESOLVER SCHEMA DUAL (CRÍTICO)

### 🔴 Problema: Dos fuentes de verdad coexistiendo

**Estado actual:**
- `src/lib/db/schema.ts` (389 líneas) → **ACTIVO** (importado por services)
- `src/lib/db/schema-fusion.ts` (596 líneas) → **MUERTO** (nadie lo importa)

**Discrepancias críticas:**

| Aspecto | schema.ts | schema-fusion.ts |
|---------|-----------|------------------|
| Tabla members | `organization_members` | `members` |
| users.role tipo | `text('role')` | `userRoleEnum('role')` |
| userRoleEnum valores | owner/admin/member | superadmin/standard/invited |
| Tabla invitaciones | ❌ No existe | ✅ `pendingInvitations` |
| Relations | ❌ No tiene | ✅ Tiene todas |

### ✅ Decisión: Evolucionar `schema.ts` con lo mejor de `schema-fusion.ts`

**Plan de migración:**

1. **Agregar tabla `pending_invitations` a `schema.ts`**
   - Copiar definición de schema-fusion.ts
   - Generar migración Drizzle

2. **Cambiar `users.role` de `text()` a `userRoleEnum()`**
   - Requiere migración de datos
   - ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

3. **Agregar `relations()` a `schema.ts`**
   - Copiar todas las relaciones de schema-fusion.ts
   - Mejora inferencia de tipos en JOINs

4. **Eliminar `schema-fusion.ts`** (ya hecho en Fase 1)

**Archivo de migración esperado:**
```sql
-- drizzle/XXXX_add_pending_invitations_and_relations.sql
CREATE TABLE pending_invitations (...);
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
```

---

## FASE 4: UNIFICAR DB CLIENT (CRÍTICO)

### 🔴 Problema: Dos patrones de conexión coexistiendo

**Estado actual:**
- `src/lib/db/client.ts` → Singleton HMR-safe (`global.__db`)
- `src/lib/db/client.server.ts` → Factory per-request (`getDb(requestEvent)`)

**Usado por:**
- `client.ts` → auth-guard, rbac.service, organization.service, onboarding.service
- `client.server.ts` → demo.services.ts

**Riesgo:** El singleton NO tiene `prepare: false` explícito (requerido para Supabase Transaction Pooler).

### ✅ Decisión: Estandarizar en `client.ts` (singleton) con `prepare: false`

**Plan:**

1. **Modificar `client.ts` para agregar `prepare: false`:**
```typescript
// ANTES
client = postgres(ENV.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// DESPUÉS
client = postgres(ENV.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // CRÍTICO para Supabase Transaction Pooler
});
```

2. **Migrar `demo.services.ts` a usar `client.ts`:**
```typescript
// ANTES
import { getDb } from '~/lib/db/client.server';
const db = getDb(requestEvent);

// DESPUÉS
import { db } from '~/lib/db/client';
// Usar db directamente
```

3. **Eliminar `client.server.ts`:**
```bash
rm src/lib/db/client.server.ts
```

**Validación:** Tests deben pasar + verificar en dev que queries funcionan.

---

## FASE 5: LIMPIAR CONSOLE.LOG DE DEBUGGING (Alta Prioridad)

### 🔴 27+ console.log sin protección `import.meta.env.DEV`

**Archivos afectados:**

| Archivo | Instancias sin protección |
|---------|---------------------------|
| `src/routes/(auth)/login/index.tsx` | 4 (`🔵🟢🔴` emoji) |
| `src/routes/(auth)/register/index.tsx` | 4 (`🔵🟢🔴` emoji) |
| `src/routes/(auth)/callback/index.tsx` | 7 (algunos protegidos) |
| `src/routes/(app)/onboarding/index.tsx` | 6 (líneas 63, 95, 176) |

**Plan:**

1. **Proteger todos con `import.meta.env.DEV`:**
```typescript
// ANTES
console.log('🔵 [Login OAuth] Action iniciada');

// DESPUÉS
if (import.meta.env.DEV) {
  console.log('🔵 [Login OAuth] Action iniciada');
}
```

2. **O eliminar si son debugging temporal** (emoji logs son debugging)

**Validación:** `grep -r "console\\.log" src/routes/ | grep -v "import.meta.env.DEV"` debe devolver 0 resultados.

---

## FASE 6: RESOLVER INCONSISTENCIAS DE TIPOS (Alta Prioridad)

### 1. `requestEvent: any` en middleware.ts

**Archivo:** `src/lib/auth/middleware.ts` (línea ~50)

```typescript
// ANTES
export async function getUserRoleContext(requestEvent: any) {

// DESPUÉS
import type { RequestEventCommon } from '@builder.io/qwik-city';
export async function getUserRoleContext(requestEvent: RequestEventCommon) {
```

### 2. `DemoWidget` props con `any`

**Archivo:** `src/features/demo/components/DemoWidget.tsx` (líneas 23-24)

```typescript
// ANTES
interface DemoWidgetProps {
  requestAction: any;
  verifyAction: any;
}

// DESPUÉS
import type { ActionStore } from '@builder.io/qwik-city';
import type { DemoActionResult } from '../types/demo.types';
import type { DemoFormInput, VerificationInput } from '../schemas';

interface DemoWidgetProps {
  requestAction: ActionStore<DemoActionResult, DemoFormInput>;
  verifyAction: ActionStore<DemoActionResult, VerificationInput>;
}
```

---

## FASE 7: ALINEAR INDUSTRIAS (CRÍTICO)

### 🔴 Problema: Desincronización entre schema DB, Zod, y templates

**Estado:**
- `schema.ts` → `industrySectorEnum`: 5 valores (`concesionario, inmobiliaria, retail, alquiladora, sat`)
- `onboarding.schemas.ts` → 7 valores (+ `despacho, clinica`)
- `demo-data-templates.ts` → 7 valores (+ `despacho, clinica`)
- `features/demo/data/agents.ts` → 5 valores (solo DB enum)

**Riesgo:** Usuario selecciona `clinica` en onboarding → INSERT OK en `organizations.industry` (text sin constraint). Pero si intenta demo con `clinica` → INSERT FAIL en `users_demo.industry` (enum estricto).

### ✅ Decisión: Ampliar enum DB a 7 valores

**Plan:**

1. **Generar migración para ampliar enum:**
```sql
-- drizzle/XXXX_add_despacho_clinica_industries.sql
ALTER TYPE industry_sector ADD VALUE 'despacho';
ALTER TYPE industry_sector ADD VALUE 'clinica';
```

2. **Validar alineación:**
   - `schema.ts` → 7 valores
   - `onboarding.schemas.ts` → 7 valores ✅ (ya tiene)
   - `demo-data-templates.ts` → 7 valores ✅ (ya tiene)
   - `features/demo/data/agents.ts` → Agregar 2 valores faltantes

3. **Agregar agent IDs para `despacho` y `clinica`:**
```typescript
// features/demo/data/agents.ts
export const SECTOR_AGENTS = {
  concesionario: 'agent_79d33b92c7dd3e1b9f0e365afc',
  inmobiliaria: 'agent_05d7edd31584c7345b5b99c47f',
  retail: 'agent_d47e0e39a47a785a348fe96bb5',
  alquiladora: 'agent_79d33b92c7dd3e1b9f0e365afc', // Reutiliza
  sat: 'agent_d47e0e39a47a785a348fe96bb5', // Reutiliza
  despacho: 'agent_05d7edd31584c7345b5b99c47f', // NUEVO (reutilizar inmobiliaria)
  clinica: 'agent_d47e0e39a47a785a348fe96bb5', // NUEVO (reutilizar retail/sat)
};

export const SECTOR_LABELS: Record<SectorType, string> = {
  // ... existentes
  despacho: 'Despacho profesional',
  clinica: 'Clínica/Centro médico',
};
```

---

## FASE 8: SEGURIDAD (CRÍTICO)

### 1. Webhook sin validación de firma

**Archivo:** `src/routes/api/demo/webhook/index.ts`

**Implementar validación:**
```typescript
// Añadir antes del procesamiento
const signature = requestEvent.headers.get('x-retell-signature');
const secret = ENV.RETELL_WEBHOOK_SECRET;

if (!validateRetellSignature(signature, payload, secret)) {
  json(401, { success: false, error: 'INVALID_SIGNATURE' });
  return;
}

function validateRetellSignature(
  signature: string | null,
  payload: unknown,
  secret: string
): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 2. `Math.random()` → `crypto.randomInt()`

**Archivo:** `src/features/demo/services/verification.service.ts` (línea 33)

```typescript
// ANTES
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

// DESPUÉS
import { randomInt } from 'node:crypto';

export function generateVerificationCode(): string {
  const code = randomInt(100000, 1000000); // 100000-999999
  return code.toString();
}
```

### 3. Eliminar export de `processDemoRequest`

**Archivo:** `src/features/demo/index.ts`

```typescript
// ANTES
export {
  requestDemoVerification,
  verifyAndTriggerDemo,
  processDemoRequest, // ← ELIMINAR (flujo legacy sin OTP)
  updateDemoFromWebhook,
  linkDemoToOrganization,
} from './services/demo.services';

// DESPUÉS
export {
  requestDemoVerification,
  verifyAndTriggerDemo,
  // processDemoRequest eliminado (legacy, bypass OTP)
  updateDemoFromWebhook,
  linkDemoToOrganization,
} from './services/demo.services';
```

---

## FASE 9: REFACTORIZACIÓN DE UI (Media Prioridad)

### 1. Extraer SVGs del Sidebar

**Problema:** `dashboard-sidebar.tsx` tiene ~100 líneas de SVGs inline.

**Plan:**
```bash
mkdir -p src/components/icons
# Crear archivo src/components/icons/dashboard-icons.tsx
# Mover IconMap a componentes SVG separados
```

```typescript
// src/components/icons/dashboard-icons.tsx
export const HomeIcon = component$(() => (
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
));
```

### 2. Dividir Landing Monolítica

**Problema:** `src/routes/(public)/index.tsx` tiene 487 líneas.

**Plan:**
```bash
mkdir -p src/features/landing/components
# Crear componentes:
# - HeroSection.tsx
# - FeaturesSection.tsx
# - LiveDemoSection.tsx
# - SectorsSection.tsx
# - PricingSection.tsx
# - CTASection.tsx
```

### 3. Dividir Onboarding Monolítico

**Problema:** `src/routes/(app)/onboarding/index.tsx` tiene 622 líneas.

**Plan:**
```bash
mkdir -p src/features/onboarding/components
# Crear componentes:
# - Step1IdentidadCorporativa.tsx
# - Step2ReglasNegocio.tsx
# - Step3PersonalidadAsistente.tsx
# - ProgressIndicator.tsx
```

---

## FASE 10: CORRECCIONES MENORES

### 1. Memoizar `getCurrentDate()` en dashboard-footer

```typescript
// ANTES
const getCurrentDate = () => {
  const now = new Date();
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
};

return (
  <footer>
    <p>{getCurrentDate()}</p>
  </footer>
);

// DESPUÉS
import { useComputed$ } from '@builder.io/qwik';

const currentDate = useComputed$(() => {
  const now = new Date();
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
});

return (
  <footer>
    <p>{currentDate.value}</p>
  </footer>
);
```

### 2. Versión dinámica en dashboard-footer

```typescript
// ANTES
<p>v1.0.0</p>

// DESPUÉS
<p>v{import.meta.env.PUBLIC_APP_VERSION || '1.0.0'}</p>
```

### 3. Limpiar rutas inexistentes en menu-options.ts

**Eliminar o comentar rutas no implementadas:**
- `/dashboard/llamadas`
- `/dashboard/agente`
- `/dashboard/numeros`
- `/dashboard/integraciones`
- `/dashboard/base-conocimiento`
- `/dashboard/configuracion`

Dejar solo las implementadas:
- `/dashboard` ✅
- `/dashboard/usuarios` ✅
- `/dashboard/facturacion` ✅

---

## FASE 11: OPTIMIZACIÓN DE QUERIES (Media Prioridad)

### Reducir redundancia en `usuarios/index.tsx`

**Problema:** Cada action (invite, changeRole, remove) llama independientemente a `AuthService.getAuthUser` y resuelve orgId.

**Solución:** Leer orgId del sharedMap de auth-guard en lugar de refetchear.

```typescript
// ANTES (en cada action)
const authUser = await AuthService.getAuthUser(requestEvent);
const orgsWithRoles = await RBACService.getUserOrganizationsWithRoles(authUser.id);
const orgId = orgsWithRoles[0]?.orgId;

// DESPUÉS (reutilizar sharedMap de auth-guard)
const guardData = await getAuthGuardData(requestEvent);
if (!guardData) throw requestEvent.redirect(302, '/login');
const orgId = guardData.userOrgs[0]?.orgId;
```

**Reducción esperada:** 3 queries → 0 queries adicionales (usa cache).

---

## CHECKLIST DE EJECUCIÓN

### ✅ Commits por Fase

- [ ] **Fase 1:** `chore: eliminar archivos residuales (schema-fusion, rbac-examples, client.browser)`
- [ ] **Fase 2:** `refactor: limpiar loaders sin uso en rbac-loaders.ts`
- [ ] **Fase 3:** `feat: migrar schema.ts con pending_invitations + relations + users.role enum`
- [ ] **Fase 4:** `refactor: unificar DB client en singleton con prepare:false`
- [ ] **Fase 5:** `refactor: proteger console.log con import.meta.env.DEV`
- [ ] **Fase 6:** `fix: tipar requestEvent y DemoWidget props`
- [ ] **Fase 7:** `feat: ampliar industrySectorEnum con despacho y clinica`
- [ ] **Fase 8:** `security: validar webhook signature + crypto.randomInt + eliminar processDemoRequest export`
- [ ] **Fase 9:** `refactor: extraer SVGs sidebar + dividir landing + dividir onboarding`
- [ ] **Fase 10:** `fix: memoizar getCurrentDate + versión dinámica + limpiar menu-options`
- [ ] **Fase 11:** `perf: optimizar queries en usuarios/index.tsx usando sharedMap`

### ✅ Validación Post-Implementación

```bash
# Build sin errores
bun run build

# Lint sin errores
bun run lint

# Tests pasan
bun test

# Verificar migraciones DB
bun run db:generate
bun run db:push

# Verificar que NO hay console.log sin protección
grep -r "console\.log" src/routes/ | grep -v "import.meta.env.DEV"

# Verificar que NO hay imports de archivos eliminados
grep -r "schema-fusion\|rbac-examples\|client.browser" src/
```

---

## MÉTRICAS DE IMPACTO

| Métrica | Antes | Después | Delta |
|---------|-------|---------|-------|
| **Líneas de código muerto** | ~1.086 | 0 | -1.086 |
| **Archivos residuales** | 3 | 0 | -3 |
| **Schemas duplicados** | 2 | 1 | -1 |
| **DB clients** | 2 | 1 | -1 |
| **console.log sin protección** | 27+ | 0 | -27 |
| **Tipos `any`** | 3 | 0 | -3 |
| **Industrias desalineadas** | 3 fuentes | 1 fuente | Alineado |
| **Queries redundantes usuarios** | 3/action | 0/action | -3 |
| **Vulnerabilidades seguridad** | 3 | 0 | -3 |

**Tiempo estimado:** 8-12 horas de trabajo (priorizar Fases 1-8).

---

## PRIORIZACIÓN FINAL

### 🔥 Crítico (hacer YA)
1. Fase 1 — Eliminar residuales
2. Fase 3 — Resolver schema dual
3. Fase 4 — Unificar DB client
4. Fase 7 — Alinear industrias
5. Fase 8 — Seguridad (webhook, crypto)

### ⚠️ Alta (hacer esta semana)
6. Fase 2 — Limpiar loaders muertos
7. Fase 5 — Proteger console.log
8. Fase 6 — Tipar `any`

### 📝 Media (hacer próximas 2 semanas)
9. Fase 9 — Refactorizar UI monolíticas
10. Fase 10 — Correcciones menores
11. Fase 11 — Optimizar queries

---

**Revisado:** 14 de febrero de 2026  
**Próxima revisión:** Post-implementación de Fases 1-8
