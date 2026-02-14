# Estándares de Optimización de Queries - Drizzle ORM

**Propósito**: Definir patrones **obligatorios** y **medibles** para optimizar el acceso a la base de datos, evitando anti-patrones N+1, queries redundantes y uso ineficiente del pooler de conexiones.

**Versión:** 1.0  
**Target:** PostgreSQL 15+ con Supabase Transaction Pooler (pgbouncer)

---

## 1. PRINCIPIOS FUNDAMENTALES (OBLIGATORIOS)

### 1.1 Regla de Oro: Mínimas Queries por Request

**Objetivo cuantificable:**
- ✅ **Ideal:** 1-2 queries por carga de página
- ⚠️ **Aceptable:** 3-4 queries (con justificación)
- 🔴 **Inaceptable:** 5+ queries sin estrategia de batching

### 1.2 Anti-Patrón N+1 (PROHIBIDO)

```typescript
// ❌ PROHIBIDO: 1 query inicial + N queries en loop
const users = await db.select().from(users);
for (const user of users) {
  const orgs = await db.select().from(orgs).where(eq(orgs.userId, user.id)); // N queries
}

// ✅ CORRECTO: 1 query con JOIN
const usersWithOrgs = await db
  .select({
    userId: users.id,
    userName: users.name,
    orgId: orgs.id,
    orgName: orgs.name,
  })
  .from(users)
  .leftJoin(orgs, eq(users.id, orgs.userId));
```

### 1.3 Compartir Datos con `sharedMap` (OBLIGATORIO)

**Contexto:** Evitar re-consultar datos ya obtenidos en el layout.

```typescript
// ❌ PROHIBIDO: Layout y página consultan lo mismo
// layout.tsx
export const useLayoutData = routeLoader$(async (req) => {
  const user = await getUser(req);
  return user; // Query 1
});

// dashboard/index.tsx
export const useDashboard = routeLoader$(async (req) => {
  const user = await getUser(req); // Query 2 (duplicada!)
  return { user };
});

// ✅ CORRECTO: sharedMap para compartir datos
// layout.tsx
export const useLayoutData = routeLoader$(async (req) => {
  const user = await getUser(req);
  req.sharedMap.set('user', user); // Compartir
  return user;
});

// dashboard/index.tsx
export const useDashboard = routeLoader$(async (req) => {
  const user = req.sharedMap.get('user'); // Reutilizar (0 queries)
  const stats = await getStats(user.id); // Solo 1 query nueva
  return { user, stats };
});
```

**Referencia:** [SUPABASE_DRIZZLE_MASTER.md § 8 - sharedMap Pattern](./SUPABASE_DRIZZLE_MASTER.md#8-consumo-seguro-en-rutas-protegidas)

---

## 2. PATRONES DE OPTIMIZACIÓN (OBLIGATORIOS)

### 2.1 JOIN en vez de Queries Separadas

**Caso común:** Obtener usuario + sus organizaciones

```typescript
// ❌ ANTI-PATRÓN: 2 queries separadas
const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
const orgs = await db
  .select()
  .from(organizationMembers)
  .innerJoin(organizations, ...)
  .where(eq(organizationMembers.userId, userId));

// ✅ OPTIMIZADO: 1 query con JOIN
const [userData] = await db
  .select({
    id: users.id,
    email: users.email,
    fullName: users.fullName,
    orgId: organizations.id,
    orgName: organizations.name,
    orgRole: organizationMembers.role,
  })
  .from(users)
  .leftJoin(organizationMembers, eq(users.id, organizationMembers.userId))
  .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
  .where(eq(users.id, userId));
```

**Reducción:** 2 queries → 1 query (50% menos)

### 2.2 Batch UPDATEs en vez de UPDATEs Consecutivos

**Caso común:** Actualizar múltiples campos del mismo registro

```typescript
// ❌ ANTI-PATRÓN: 2 UPDATEs consecutivos
await db.update(users).set({ fullName: 'John' }).where(eq(users.id, userId));
await db.update(users).set({ onboardingCompleted: true }).where(eq(users.id, userId));

// ✅ OPTIMIZADO: 1 UPDATE con múltiples campos
await db
  .update(users)
  .set({
    fullName: 'John',
    onboardingCompleted: true,
    updatedAt: new Date(),
  })
  .where(eq(users.id, userId));
```

**Reducción:** 2 queries → 1 query (50% menos)

### 2.3 Transacciones para Atomicidad

**Caso común:** Crear organización + añadir usuario como miembro

```typescript
// ❌ SIN TRANSACCIÓN: Riesgo de estado inconsistente
const [org] = await db.insert(organizations).values({...}).returning();
await db.insert(organizationMembers).values({...}); // Si falla, org huérfana

// ✅ CON TRANSACCIÓN: Todo o nada
await db.transaction(async (tx) => {
  const [org] = await tx.insert(organizations).values({...}).returning();
  await tx.insert(organizationMembers).values({
    organizationId: org.id,
    userId,
    role: 'owner',
  });
});
```

**Ventaja:** Integridad de datos garantizada

**Referencia:** [SUPABASE_DRIZZLE_MASTER.md § 7 - Transacciones](./SUPABASE_DRIZZLE_MASTER.md#7-transacciones)

### 2.4 UPSERT en vez de SELECT + INSERT Condicional

**Caso común:** Crear registro si no existe, actualizar si existe

```typescript
// ❌ ANTI-PATRÓN: SELECT + Lógica condicional + INSERT/UPDATE
const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
if (existing.length === 0) {
  await db.insert(users).values({...});
} else {
  await db.update(users).set({...}).where(eq(users.id, userId));
}

// ✅ OPTIMIZADO: UPSERT idempotente (1 query)
await db
  .insert(users)
  .values({ id: userId, email, fullName })
  .onConflictDoUpdate({
    target: users.id,
    set: { fullName, updatedAt: new Date() },
  });
```

**Reducción:** 2-3 queries → 1 query (hasta 67% menos)

### 2.5 Delegar Validación a PostgreSQL (Triggers/Constraints)

**Caso común:** Rate limiting de demos

```typescript
// ❌ ANTI-PATRÓN: Validar en app (2 queries)
const count = await db
  .select({ count: sql<number>`count(*)` })
  .from(usersDemo)
  .where(eq(usersDemo.phone, phone));
if (count[0].count >= 200) throw new Error('Rate limit exceeded');
await db.insert(usersDemo).values({...});

// ✅ OPTIMIZADO: Trigger PostgreSQL valida automáticamente (1 query)
await db.insert(usersDemo).values({...}); // Trigger ejecuta validate_demo_rate_limits()
```

**Reducción:** 2 queries → 1 query (50% menos)  
**Ventaja adicional:** Validación imposible de bypassear

**Referencia:** [DEMO_ARCHITECTURE.md - Rate Limiting](../features/DEMO_ARCHITECTURE.md)

---

## 3. ESTRATEGIAS DE CACHÉ (CONTEXTUAL)

### 3.1 Cuándo Cachear

| Dato | Cache Duration | Justificación |
|------|---------------|---------------|
| **User Profile** | 5-10 min | Raramente cambia, alta frecuencia de lectura |
| **Organizations** | 10-15 min | Cambios esporádicos |
| **Subscription Tier** | 15-30 min | Solo cambia en upgrades/downgrades |
| **Real-time Metrics** | Sin caché | Datos dinámicos |
| **Rate Limits** | Sin caché | Seguridad crítica |

### 3.2 Implementación con Upstash/Redis (Futuro)

```typescript
// Patrón: Cache-Aside
export async function getUserProfile(userId: string) {
  // 1. Intentar cache
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  // 2. Consultar DB
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  // 3. Almacenar en cache (5 min)
  await redis.setex(`user:${userId}`, 300, JSON.stringify(user));

  return user;
}
```

**Nota:** Implementar solo cuando métricas demuestren necesidad (premature optimization es root of evil).

---

## 4. MÉTRICAS Y MONITOREO (OBLIGATORIO)

### 4.1 Criterios de Auditoría

Un agente AI debe poder verificar:

✅ **Medible Automáticamente:**
- [ ] Ningún `for` loop contiene `await db.select()` (N+1 check)
- [ ] Máximo 3 queries por `routeLoader$` sin justificación
- [ ] Toda secuencia de INSERTs relacionados usa `db.transaction()`
- [ ] No hay UPDATEs consecutivos al mismo registro en 5 líneas de código
- [ ] `sharedMap` se usa cuando layout y página necesitan los mismos datos

⚠️ **Revisión Manual:**
- [ ] JOINs complejos tienen índices adecuados en DB
- [ ] Queries con `LIKE '%term%'` justifican no usar full-text search
- [ ] Paginación implementada para listas >100 registros

### 4.2 Slow Query Threshold

**Target:** 95% de queries < 200ms

**Herramientas:**
- Supabase Dashboard → Performance → Slow Queries
- Drizzle Studio → Query Inspector
- Logs con `console.time()` en dev:

```typescript
// Instrumentación temporal para debugging
console.time('getUserOrgs');
const orgs = await db.select()...;
console.timeEnd('getUserOrgs'); // getUserOrgs: 145ms
```

---

## 5. CHECKLIST DE CÓDIGO REVIEW

Antes de aprobar un PR que toca servicios (`lib/services/`) o features con DB:

- [ ] **N+1 Check:** Ningún loop ejecuta queries individuales
- [ ] **JOIN Check:** Queries relacionadas están fusionadas
- [ ] **Transaction Check:** INSERTs/UPDATEs relacionados usan transacción
- [ ] **sharedMap Check:** Datos del layout no se re-consultan en rutas hijas
- [ ] **UPSERT Check:** Lógica SELECT + INSERT condicional usa `onConflictDoUpdate`
- [ ] **Batch Check:** UPDATEs consecutivos al mismo registro están fusionados
- [ ] **Index Check:** JOINs en columnas indexadas (verificar con `EXPLAIN`)
- [ ] **Rate Limit Check:** Validaciones de límites usan triggers/constraints DB

---

## 6. CASOS DE USO DOCUMENTADOS

### 6.1 Auth Guard (Referencia Actual)

**Ubicación:** `src/lib/auth/auth-guard.ts`  
**Problema:** 3 queries separadas (getUser + SELECT users + getUserOrganizations)  
**Solución:** Ver [ANALISIS_QUERIES_DB_2026-02-14.md - Fase 1](../plans/ANALISIS_QUERIES_DB_2026-02-14.md#fase-1-optimizaciones-de-alto-impacto-inmediatas)

### 6.2 Demo Request (Referencia Excelente)

**Ubicación:** `src/features/demo/services/demo.services.ts`  
**Implementación:** Trigger `validate_demo_rate_limits()` en INSERT  
**Queries:** 1 (óptimo)  
**Justificación:** Validación delegada a PostgreSQL, imposible bypassear

---

## 7. ANTI-PATRONES PROHIBIDOS

| Anti-Patrón | Descripción | Penalización |
|-------------|-------------|--------------|
| **N+1 Queries** | Loop con `await db.select()` | 🔴 Bloqueo de PR |
| **SELECT * sin necesidad** | Traer columnas no usadas | ⚠️ Refactor requerido |
| **Missing Indexes en JOINs** | JOIN sin índice en FK | ⚠️ Crear índice |
| **Queries en componentes UI** | `await db.select()` en `component$()` | 🔴 Bloqueo de PR |
| **Missing `prepare: false`** | Prepared statements con pgbouncer | 🔴 Error en runtime |
| **Retry logic sin UPSERT** | SELECT + delay + SELECT | ⚠️ Usar UPSERT |

---

## 8. ROADMAP DE OPTIMIZACIÓN

### Fase 1: Fixes Inmediatos (1-2 días)
- [ ] Optimizar Auth Guard (3→1 query)
- [ ] Fusionar UPDATEs duplicados

### Fase 2: Arquitectura (1 semana)
- [ ] Auditar todos los services con N+1 detector
- [ ] Añadir transacciones donde falten

### Fase 3: Infraestructura (Futuro)
- [ ] Implementar Redis/Upstash para cache
- [ ] Query performance monitoring dashboard
- [ ] Automated slow query alerts (>500ms)

---

## 9. RECURSOS Y REFERENCIAS

- [Drizzle ORM - Transactions](https://orm.drizzle.team/docs/transactions)
- [Drizzle ORM - Joins](https://orm.drizzle.team/docs/joins)
- [PostgreSQL - UPSERT](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
- [Supabase - Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [SUPABASE_DRIZZLE_MASTER.md](./SUPABASE_DRIZZLE_MASTER.md)
- [DEMO_ARCHITECTURE.md](../features/DEMO_ARCHITECTURE.md)

---

**Estándar creado:** 14 de febrero de 2026  
**Próxima revisión:** Post-implementación de optimizaciones Fase 1
