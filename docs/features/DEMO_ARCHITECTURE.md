# Demo Feature - Arquitectura y Validación

## ✅ Flujo Actual (CORRECTO)

### 1. **Formulario en Landing Page**
[routes/(public)/index.tsx](../../src/routes/(public)/index.tsx)
- `useDemoRequestAction()` - routeAction$ (Step 1: envía código)
- `useVerifyCodeAction()` - routeAction$ (Step 2: verifica + llama)
- `DemoWidget` - Componente UI con Form

### 2. **Servicios de Negocio**
[features/demo/services/demo.services.ts](../../src/features/demo/services/demo.services.ts)
- `requestDemoVerification()` - Genera código + envía email
- `verifyAndTriggerDemo()` - Valida código + dispara Retell

### 3. **Validación de Rate Limits**
⚡ **PostgreSQL Function + Trigger** (single source of truth)

**Archivo:** [drizzle/manual/validate_demo_rate_limits.sql](../../drizzle/manual/validate_demo_rate_limits.sql)

**Reglas:**
- Máximo 200 demos por teléfono en 1 mes (cambiar a 2 en producción)
- Máximo 200 intentos por IP en 1 mes (anti-bots)
- Auto-bloqueo de IP si excede límite
- Reset automático después de 1 mes

**Trigger:**
```sql
CREATE TRIGGER validate_demo_before_insert
  BEFORE INSERT ON users_demo
  FOR EACH ROW
  EXECUTE FUNCTION validate_demo_rate_limits();
```

**Errores Lanzados:**
- `RATE_LIMIT_EXCEEDED: Phone X has exceeded 200 calls per month`
- `IP_BLOCKED: IP X is blocked. Reason: ...`

**Captura en TypeScript:**
```typescript
try {
  await db.insert(usersDemo).values({...});
} catch (error) {
  if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
    return { success: false, error: 'RATE_LIMIT_EXCEEDED' };
  }
  if (error.message.includes('IP_BLOCKED')) {
    return { success: false, error: 'IP_BLOCKED' };
  }
}
```

---

## 🗑️ Archivos Eliminados (Sobreingeniería)

Los siguientes endpoints eran **innecesarios** porque el flujo usa `routeAction$`:

- ❌ `src/routes/api/demo/request/index.ts` (duplicaba useDemoRequestAction)
- ❌ `src/routes/api/demo/verify/index.ts` (duplicaba useVerifyCodeAction)

### ✅ Archivo Mantenido

- ✅ `src/routes/api/demo/webhook/index.ts` - **NECESARIO** para recibir callbacks de Retell post-llamada

---

## 📊 Ventajas de esta Arquitectura

1. **Single Source of Truth**: Validación en PostgreSQL (no duplicada en código)
2. **Atómico**: INSERT + validación en una transacción
3. **Menos Código**: Sin lógica TypeScript redundante
4. **Reutilizable**: Cualquier INSERT pasa por el trigger (ej: admin panel, importaciones)
5. **Mantenible**: Cambiar límites solo requiere UPDATE en PostgreSQL

---

## 🚀 Deployment

### 1. Aplicar la Function y Trigger

```bash
# Conectar a Supabase (session mode - puerto 5432)
psql postgresql://user:pass@db.project.supabase.co:5432/postgres

# Ejecutar el script
\i drizzle/manual/validate_demo_rate_limits.sql

# O desde la interfaz de Supabase SQL Editor
```

### 2. Ajustar Límites en Producción

```sql
-- Cambiar de 200 a 2 demos por teléfono
UPDATE pg_proc
SET prosrc = replace(prosrc, 'v_max_calls INTEGER := 200', 'v_max_calls INTEGER := 2')
WHERE proname = 'validate_demo_rate_limits';

-- O recrear la función con el límite correcto
```

---

## 🧪 Testing

### Test Rate Limit por Teléfono

```typescript
// Insertar 2 demos con el mismo teléfono
await db.insert(usersDemo).values({ phone: '+34612345678', ... }); // ✅ OK
await db.insert(usersDemo).values({ phone: '+34612345678', ... }); // ✅ OK (2º)
await db.insert(usersDemo).values({ phone: '+34612345678', ... }); // ❌ RATE_LIMIT_EXCEEDED
```

### Test Rate Limit por IP

```typescript
// 201 inserts con la misma IP
for (let i = 0; i < 201; i++) {
  await db.insert(usersDemo).values({ ipAddress: '192.168.1.1', ... });
}
// El insert #201 → Auto-bloquea IP
// Nuevos inserts con esa IP → IP_BLOCKED exception
```

---

## 📝 Cambios Realizados

### Archivos Modificados

1. **[features/demo/services/demo.services.ts](../../src/features/demo/services/demo.services.ts)**
   - ❌ Eliminadas: `checkRateLimit()`, `checkIpRateLimit()`, `incrementIpTrialCount()`
   - ✅ Simplificada: `requestDemoVerification()` solo hace INSERT, captura errores de PostgreSQL

2. **[features/demo/index.ts](../../src/features/demo/index.ts)**
   - ❌ Eliminadas exports: `checkRateLimit`, `checkIpRateLimit`, `incrementIpTrialCount`

### Archivos Creados

1. **[drizzle/manual/validate_demo_rate_limits.sql](../../drizzle/manual/validate_demo_rate_limits.sql)**
   - PostgreSQL Function con lógica de validación completa
   - Trigger BEFORE INSERT en `users_demo`

---

## 🔍 Verificación

**Build exitoso:**
```bash
bun run build
# ✓ Type checked
# ✓ Lint checked
```

**Flujo funcional:**
1. Usuario llena formulario en landing page
2. `useDemoRequestAction` → `requestDemoVerification()`
3. Trigger valida rate limits → INSERT en `users_demo`
4. Email enviado con código
5. Usuario ingresa código → `useVerifyCodeAction` → `verifyAndTriggerDemo()`
6. Llamada disparada a Retell
7. Webhook recibe callback → `updateDemoFromWebhook()`
