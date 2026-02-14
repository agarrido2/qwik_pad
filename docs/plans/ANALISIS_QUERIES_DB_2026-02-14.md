# 📊 ANÁLISIS DE QUERIES A BASE DE DATOS - QWIK PAD

**Fecha:** 14 de febrero de 2026  
**Alcance:** Todas las peticiones SQL/Supabase en la aplicación  
**ORM:** Drizzle ORM + Supabase (Auth)

---

## 🎯 RESUMEN EJECUTIVO

**Total de queries identificadas:** 18-21 queries (dependiendo del flujo)

| Flujo | Queries | Cacheable | Optimizable |
|-------|---------|-----------|-------------|
| **Auth Guard (Login)** | 2 | ⚠️ Parcial | ✅ Sí (1) |
| **OAuth Callback** | 4-7 | ❌ No | ✅ Sí (3) |
| **Onboarding Completo** | 5 | ❌ No | ⚠️ Medio |
| **Demo Request** | 1-2 | ❌ No | ✅ Sí (1) |
| **Demo Verification** | 3 | ❌ No | ✅ Sí (1) |
| **Dashboard (carga)** | 2 | ✅ Sí | ✅ Sí (1) |

---

## 📋 DETALLE POR FLUJO

### 1️⃣ Auth Guard (Protección de Rutas Privadas)

**Archivo:** [src/lib/auth/auth-guard.ts](../src/lib/auth/auth-guard.ts)  
**Contexto:** Se ejecuta en CADA carga de página privada (dashboard, onboarding)

#### Queries Ejecutadas:

```typescript
// Query 1: AuthService.getAuthUser() - Supabase Auth
await supabase.auth.getUser();

// Query 2: SELECT user profile
await db
  .select()
  .from(users)
  .where(eq(users.id, authUser.id))
  .limit(1);

// Query 3: OrganizationService.getUserOrganizations()
await db
  .select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    subscriptionTier: organizations.subscriptionTier,
    industry: organizations.industry,
    role: organizationMembers.role,
  })
  .from(organizationMembers)
  .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
  .where(eq(organizationMembers.userId, userId));
```

**Total:** 3 queries (1 Auth + 2 DB)

#### 🔴 Problema Identificado: N+1 Potencial

**Ubicación:** [src/routes/(app)/layout.tsx](../src/routes/(app)/layout.tsx#L12-L35)

```tsx
// ❌ ACTUAL: 3 queries separadas en cada carga de página
export const useAppGuard = routeLoader$(async (requestEvent) => {
  const data = await getAuthGuardData(requestEvent);
  // Cada vez se consulta: auth.users → public.users → organizations
});
```

**Impacto:**
- Dashboard carga: 3 queries
- Onboarding carga: 3 queries
- Cualquier navegación en (app): +3 queries

**Solución Propuesta:**
```typescript
// ✅ OPTIMIZADO: 1 query con JOIN + cache en sharedMap
const [user] = await db
  .select({
    id: users.id,
    email: users.email,
    fullName: users.fullName,
    onboardingCompleted: users.onboardingCompleted,
    // Join organizations directamente
    orgId: organizations.id,
    orgName: organizations.name,
    orgSlug: organizations.slug,
    // ...resto de campos
  })
  .from(users)
  .leftJoin(organizationMembers, eq(users.id, organizationMembers.userId))
  .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
  .where(eq(users.id, authUserId));
```

**Reducción:** 3 queries → 1 query (66% menos)

---

### 2️⃣ OAuth Callback (Registro vía Google)

**Archivo:** [src/routes/(auth)/callback/index.tsx](../src/routes/(auth)/callback/index.tsx)  
**Contexto:** Usuario se registra con Google OAuth

#### Queries Ejecutadas:

```typescript
// Query 1: Intercambiar código OAuth
await supabase.auth.exchangeCodeForSession(code);

// Query 2: Verificar sesión establecida
await supabase.auth.getSession();

// Queries 3-5: ensureUserExistsAfterOAuth() - RETRY LOOP
// Intento 1:
const { data } = await supabase
  .from('users')
  .select('id, email, role, subscription_tier, onboarding_completed')
  .eq('id', authUserId)
  .single();

// Intento 2 (si falla):
await new Promise(resolve => setTimeout(resolve, 500));
await supabase.from('users').select(...); // +1 query

// Intento 3 (si falla):
await new Promise(resolve => setTimeout(resolve, 1000));
await supabase.from('users').select(...); // +1 query

// Query 6-7: Fallback manual (si trigger falló)
await supabase.from('users').insert({...}); // +1 query
await supabase.from('users').select(...);   // +1 query para refrescar
```

**Total:** 4-7 queries (2 Auth + 2-5 DB)

#### 🟡 Problema Identificado: Retry Logic Agresivo

**Ubicación:** [src/lib/services/auth.service.ts](../src/lib/services/auth.service.ts#L134-L166)

**Problema:**
- Hasta 3 intentos con delays incrementales (500ms, 1000ms, 1500ms)
- En el peor caso: 3 SELECT + 1 INSERT + 1 SELECT = 5 queries DB
- Delay total acumulado: hasta 3 segundos de espera

**Causa Raíz:** Race condition con trigger `handle_new_auth_user()`

**Solución Propuesta:**
```sql
-- Opción 1: Trigger SINCRÓNICO (bloqueante) en vez de async
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, ...)
  VALUES (NEW.id, NEW.email, ...) 
  ON CONFLICT (id) DO NOTHING; -- Idempotente
  RETURN NEW;
END;
$$;

-- Opción 2: Usar UPSERT directo en app (sin retry)
INSERT INTO users (id, email, ...) 
VALUES (...)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
RETURNING *;
```

**Reducción:** 4-7 queries → 2-3 queries (43-57% menos)

---

### 3️⃣ Onboarding Completo

**Archivo:** [src/lib/services/onboarding.service.ts](../src/lib/services/onboarding.service.ts#L17-L82)  
**Contexto:** Usuario completa los 3 pasos de onboarding

#### Queries Ejecutadas:

```typescript
// Query 1: Actualizar nombre del usuario
await db
  .update(users)
  .set({ fullName: data.fullName })
  .where(eq(users.id, userId));

// Query 2: Crear organización
await db
  .insert(organizations)
  .values({...})
  .returning();

// Query 3: Añadir usuario como owner
await db
  .insert(organizationMembers)
  .values({...})
  .returning();

// Query 4: Marcar onboarding completado
await db
  .update(users)
  .set({ onboardingCompleted: true })
  .where(eq(users.id, userId));

// Query 5: DemoDataService.generateForIndustry()
// ✅ NO ejecuta queries, solo console.log
```

**Total:** 4 queries DB

#### 🟢 Optimización Posible: Transacción

**Problema:**
- Si Query 3 falla, el usuario queda con:
  - ✅ Nombre actualizado
  - ✅ Organización creada
  - ❌ No es miembro de la org
  - ❌ Onboarding no completado

**Solución:**
```typescript
// ✅ USAR TRANSACCIÓN para atomicidad
await db.transaction(async (tx) => {
  // Las 4 queries en una transacción
  await tx.update(users).set({...});
  const [org] = await tx.insert(organizations).values({...}).returning();
  await tx.insert(organizationMembers).values({...});
  await tx.update(users).set({ onboardingCompleted: true });
});
```

**Ventaja:** Atomicidad garantizada (todo o nada)

---

### 4️⃣ Demo Request (Solicitar llamada de prueba)

**Archivo:** [src/features/demo/services/demo.services.ts](../src/features/demo/services/demo.services.ts#L43-L102)  
**Contexto:** Usuario solicita demo desde landing page

#### Queries Ejecutadas:

```typescript
// Query 1: INSERT con validación automática (trigger)
const [demoRecord] = await db
  .insert(usersDemo)
  .values({...})
  .returning();
// Trigger validate_demo_before_insert ejecuta validate_demo_rate_limits()
// → Valida límites de llamadas por teléfono (200/mes)
// → Valida límites de intentos por IP (200/mes)

// Query 2 (condicional): Si falla envío de email
await db
  .update(usersDemo)
  .set({ status: 'email_failed' })
  .where(eq(usersDemo.id, demoRecord.id));
```

**Total:** 1-2 queries (1 siempre + 1 condicional)

#### ✅ Bien Implementado

**Ventajas:**
- Validación en DB (trigger) → imposible bypass
- Rate limiting a nivel de constraint
- No hay queries adicionales para verificar límites

**Documentación:** [docs/features/DEMO_ARCHITECTURE.md](../docs/features/DEMO_ARCHITECTURE.md)

---

### 5️⃣ Demo Verification (Verificar código y llamar)

**Archivo:** [src/features/demo/services/demo.services.ts](../src/features/demo/services/demo.services.ts#L128-L231)  
**Contexto:** Usuario ingresa código OTP de 6 dígitos

#### Queries Ejecutadas:

```typescript
// Query 1: Buscar demo pendiente
const [demoRecord] = await db
  .select()
  .from(usersDemo)
  .where(
    and(
      eq(usersDemo.email, email),
      eq(usersDemo.status, 'pending_verification')
    )
  )
  .orderBy(desc(usersDemo.createdAt))
  .limit(1);

// Query 2: Actualizar status a 'verified'
await db
  .update(usersDemo)
  .set({
    status: 'verified',
    verifiedAt: new Date(),
  })
  .where(eq(usersDemo.id, demoRecord.id));

// Query 3: Actualizar con retellCallId
await db
  .update(usersDemo)
  .set({
    retellCallId: callResponse.call_id,
    status: 'call_in_progress',
  })
  .where(eq(usersDemo.id, demoRecord.id));
```

**Total:** 3 queries

#### 🟡 Optimización Posible

**Problema:** 2 UPDATEs consecutivos al mismo registro

**Solución:**
```typescript
// ✅ OPTIMIZADO: 1 solo UPDATE después de llamar a Retell
const callResponse = await triggerDemoCall(demoRecord.phone, agentId);

await db
  .update(usersDemo)
  .set({
    status: 'call_in_progress',
    verifiedAt: new Date(),
    retellCallId: callResponse.call_id,
  })
  .where(eq(usersDemo.id, demoRecord.id));
```

**Reducción:** 3 queries → 2 queries (33% menos)

---

## 📈 MÉTRICAS GLOBALES

### Queries por Caso de Uso

| Caso de Uso | Actual | Optimizado | Reducción |
|-------------|--------|------------|-----------|
| Login + Dashboard | 3 | 1 | -66% |
| OAuth Signup | 4-7 | 2-3 | -43% a -57% |
| Onboarding | 4 | 4* | 0% (atomicidad ganada) |
| Demo Request | 1-2 | 1-2 | 0% (ya óptimo) |
| Demo Verify | 3 | 2 | -33% |

*Con transacción para seguridad

### Queries Más Frecuentes

1. **Auth Guard:** Se ejecuta en CADA navegación en área privada
   - Optimización: ⚠️ **ALTA PRIORIDAD**
   - Impacto: Reduce latencia percibida en toda la app

2. **OAuth Callback:** Solo en registro inicial
   - Optimización: ⚠️ Medio (mejorar UX de signup)

3. **Demo Verification:** Alta frecuencia (landing pública)
   - Optimización: ✅ Recomendado

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Optimizaciones de Alto Impacto (Inmediatas)

**1. Auth Guard - JOIN único**
- **Archivo:** `src/lib/auth/auth-guard.ts`
- **Cambio:** 3 queries → 1 query con JOIN
- **Impacto:** Todas las páginas privadas
- **Esfuerzo:** 1-2 horas
- **Prioridad:** 🔴 ALTA

**2. Demo Verification - Fusionar UPDATEs**
- **Archivo:** `src/features/demo/services/demo.services.ts`
- **Cambio:** 3 queries → 2 queries
- **Impacto:** Flujo público de demo
- **Esfuerzo:** 30 min
- **Prioridad:** 🟡 MEDIA

---

### Fase 2: Mejoras Arquitectónicas (Semana 1-2)

**3. OAuth Callback - UPSERT en vez de retry loop**
- **Archivo:** `src/lib/services/auth.service.ts`
- **Cambio:** Eliminar retry logic, usar UPSERT idempotente
- **Impacto:** UX de registro más rápida
- **Esfuerzo:** 2-3 horas (incluye testing)
- **Prioridad:** 🟡 MEDIA

**4. Onboarding - Transacción**
- **Archivo:** `src/lib/services/onboarding.service.ts`
- **Cambio:** Envolver en `db.transaction()`
- **Impacto:** Integridad de datos garantizada
- **Esfuerzo:** 1 hora
- **Prioridad:** 🟢 BAJA (no urgente pero importante)

---

### Fase 3: Monitoreo y Caché (Futuro)

**5. Implementar Query Caching**
- **Estrategia:** 
  - User profile: Cache 5 min (raramente cambia)
  - Organizations: Cache 10 min
  - Demo rate limits: Sin caché (tiempo real)
- **Herramientas:** Redis o Upstash
- **Esfuerzo:** 1-2 días
- **Prioridad:** 🔵 BACKLOG

**6. Query Performance Monitoring**
- **Herramienta:** Drizzle Studio + Supabase Analytics
- **Métricas:** 
  - Slow query log (>200ms)
  - Query frequency heatmap
  - Connection pool usage
- **Esfuerzo:** Setup: 2 horas
- **Prioridad:** 🔵 BACKLOG

---

## 🔍 QUERIES NO ENCONTRADAS (Validación Negativa)

✅ **Confirmado:** NO hay queries innecesarias en:
- Componentes UI (`components/`)
- Layouts (`routes/(app)/layout.tsx` solo llama a guard)
- Cliente (todo server-side)

---

## 📚 REFERENCIAS

- [SUPABASE_DRIZZLE_MASTER.md](../docs/standards/SUPABASE_DRIZZLE_MASTER.md) - Sección 7: Transacciones
- [DEMO_ARCHITECTURE.md](../docs/features/DEMO_ARCHITECTURE.md) - Rate limiting en DB
- [Drizzle Docs - Transactions](https://orm.drizzle.team/docs/transactions)

---

**Auditoría completada:** 14 de febrero de 2026  
**Próxima revisión recomendada:** Post-optimización (tras aplicar Fase 1)
