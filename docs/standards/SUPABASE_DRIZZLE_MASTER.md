# GUÍA MAESTRA DE INTEGRACIÓN: QWIK + SUPABASE + DRIZZLE

> **Estándar:** Enterprise / Production-Ready
> **Versión:** 6.0 (Golden Master)
> **Objetivo:** Definir la arquitectura de persistencia blindada, desde la validación del entorno hasta el despliegue.

---

## 1. Hardening del Entorno (Validación Estricta)

No confiamos en `process.env`. Si falta una variable crítica o un puerto es incorrecto, la app debe explotar en el arranque (**Fail Fast**) antes de que un usuario sufra un error silencioso.

**Requisito:** `bun add zod dotenv`

### 1.1 Configuración de `.env`

Necesitamos dos conexiones: una para la App (Transaction Mode, escala alto) y otra para Migraciones (Session Mode, permite cambios de schema).

```env
# --- API Supabase (Auth/Realtime) ---
PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"

# --- Database Connection (APP - PRODUCCIÓN) ---
# Puerto 6543 (Transaction Mode) + pgbouncer=true
# Esta URL usa el Pooler de Supabase. Escala a miles de conexiones.
DATABASE_URL="postgres://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# --- Direct Connection (DEV & MIGRACIONES) ---
# Puerto 5432 (Session Mode).
# Requerido por Drizzle Kit para alterar tablas.
DIRECT_URL="postgres://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"

```

### 1.2 El Validador Central (`src/lib/env.server.ts`)

Este archivo actúa como guardián. Garantiza que TypeScript sepa que tus variables existen y valida que uses los puertos correctos para evitar errores de conexión silenciosos.

```typescript
import { z } from 'zod';
import * as dotenv from 'dotenv';

// Carga .env en local (en producción las variables ya estarán en el sistema)
dotenv.config();

const schema = z.object({
  // Supabase (Públicas)
  PUBLIC_SUPABASE_URL: z.string().url("URL inválida").startsWith('https://'),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Falta la Anon Key"),

  // Base de Datos (Privadas) - VALIDACIÓN ROBUSTA DE PUERTO
  // Puerto 6543 (Transaction Mode) - Para la App
  DATABASE_URL: z.string()
    .startsWith("postgres://", "DATABASE_URL debe ser postgresql")
    .refine(url => {
      const portMatch = url.match(/:(\d+)\//);
      return portMatch && portMatch[1] === '6543';
    }, 'DATABASE_URL debe usar puerto 6543 (Transaction Pooler)')
    .refine(url => url.includes('pgbouncer=true'),
      'DATABASE_URL debe incluir parámetro pgbouncer=true para Transaction Mode'),
  
  // Puerto 5432 (Session Mode) - Para Migraciones
  DIRECT_URL: z.string()
    .startsWith("postgres://", "DIRECT_URL debe ser postgresql")
    .refine(url => {
      const portMatch = url.match(/:(\d+)\//);
      return portMatch && portMatch[1] === '5432';
    }, 'DIRECT_URL debe usar puerto 5432 (Session Mode)'),
  
  // Entorno
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const processEnv = {
  PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NODE_ENV: process.env.NODE_ENV,
};

const parsed = schema.safeParse(processEnv);

if (!parsed.success) {
  console.error("❌ FATAL: Variables de entorno inválidas:", JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1); // Detener ejecución inmediatamente
}

export const ENV = parsed.data;
export const isDev = ENV.NODE_ENV === 'development';
export const isProd = ENV.NODE_ENV === 'production';

```

---

## 2. Infraestructura de Base de Datos (Drizzle Singleton)

Manejamos el pool de conexiones y el esquema agregado. Usamos el patrón Singleton para evitar agotar las conexiones durante el Hot-Reload en desarrollo y configuraciones de estabilidad para producción.

**Archivo:** `src/lib/db/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // Agregador de schemas
import { ENV, isDev, isProd } from '~/lib/env.server';

// Mantiene la conexión viva durante Hot-Reload (Dev)
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Configuración Óptima para Producción
const conn = globalForDb.conn ?? postgres(ENV.DATABASE_URL, { 
  prepare: false, // OBLIGATORIO para Supabase Transaction Mode (Pgbouncer)
  max: isProd ? 20 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30, // Reciclar conexiones cada 30min (Estabilidad Cloud)
  onnotice: () => {},   // Silencia logs ruidosos de Postgres
});

if (isDev) globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

```

---

## 3. Tipado Estricto (Supabase Gen)

**Prerrequisito Obligatorio:** Antes de usar el cliente de Auth, debemos generar los tipos oficiales de Supabase para tener **Type Safety** total y autocompletado de tablas.

**Comandos:**

```bash
# Opción 1: Desde proyecto remoto
npx supabase gen types typescript --project-id [PROJECT_ID] > src/lib/types/supabase.ts

# Opción 2: Desde instancia local
npx supabase gen types typescript --local > src/lib/types/supabase.ts

```

**Añadir a `.gitignore`:**

```gitignore
# Tipos autogenerados (regenerar en cada deploy)
src/lib/types/supabase.ts

```

---

## 4. Infraestructura de Auth (`src/lib/supabase`)

### 4.1 Cliente Servidor Context-Aware (`src/lib/supabase/server.ts`)

A diferencia de Drizzle, el cliente de Supabase **DEBE recrearse en cada petición** para inyectar las cookies de la sesión del usuario actual.

```typescript
import { createServerClient } from '@supabase/ssr';
import { type RequestEventBase } from '@builder.io/qwik-city';
import { ENV } from '~/lib/env.server';
import type { Database } from '~/lib/types/supabase'; // ✅ Tipos generados

export const createSupabaseServerClient = (ev: RequestEventBase) => {
  return createServerClient<Database>(
    ENV.PUBLIC_SUPABASE_URL,
    ENV.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return ev.cookie.get(name)?.value; },
        set(name, value, options) { ev.cookie.set(name, value, { ...options, path: '/' } as any); },
        remove(name, options) { ev.cookie.delete(name, { ...options, path: '/' } as any); },
      },
    }
  );
};

```

### 4.2 Middleware de Autenticación (El Cerebro)

En lugar de verificar auth en cada loader individualmente, usamos el **Layout Scoped** para interceptar la petición, validar la sesión una sola vez y pasar el usuario al resto de la app vía `sharedMap`. Esto optimiza el rendimiento al no ejecutarse en rutas públicas.

**Archivo:** `src/routes/(app)/layout.tsx`

```typescript
import { component$, Slot } from '@builder.io/qwik';
import { type RequestHandler } from '@builder.io/qwik-city';
import { createSupabaseServerClient } from '~/lib/supabase/server';

export const onRequest: RequestHandler = async (requestEv) => {
  // 1. Instanciar Supabase con cookies
  const supabase = createSupabaseServerClient(requestEv);

  // 2. Verificar sesión (Check JWT contra DB)
  const { data: { user }, error } = await supabase.auth.getUser();

  // 3. Manejo explícito de errores (Seguridad Hardened)
  if (error || !user) {
    if (error) {
      console.error('[Auth Guard] Token inválido:', {
        error: error.message,
        code: error.status,
        path: requestEv.url.pathname,
        ip: requestEv.request.headers.get('x-forwarded-for') || 'unknown',
      });
    }
    // Forzar logout y redirigir
    throw requestEv.redirect(302, '/login?error=session_expired');
  }

  // 4. Compartir usuario validado para loaders hijos
  requestEv.sharedMap.set('user', user);

  await requestEv.next();
};

export default component$(() => <Slot />);

```

---

## 5. Sistema de Esquemas (Feature-Sliced Design)

Los esquemas viven cerca de su lógica de negocio (en `features/`), no en una carpeta global desordenada.

**Archivo:** `src/features/auth/auth.schema.ts`

```typescript
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Enum de Roles (Sincronizado con base de datos)
export const roleEnum = pgEnum('user_role', ['admin', 'user']);

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // FK a auth.users
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

```

**Archivo:** `src/lib/db/schema.ts` (El Agregador)
Centraliza las exportaciones y define las relaciones **Cross-Feature** para evitar dependencias circulares.

```typescript
import { relations } from 'drizzle-orm';

// 1. Re-exportar tablas individuales para Drizzle
export * from '~/features/auth/auth.schema';
export * from '~/features/billing/billing.schema'; 

// 2. Importar tablas para definir relaciones (evita ciclos)
import { profiles } from '~/features/auth/auth.schema';
import { subscriptions } from '~/features/billing/billing.schema';

// 3. Relaciones Cross-Feature (Ejemplo 1:N)
// Las relaciones deben definirse AQUÍ, no en archivos individuales.
export const profilesRelations = relations(profiles, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  profile: one(profiles, {
    fields: [subscriptions.userId],
    references: [profiles.id],
  }),
}));

```

---

## 6. Estrategia de Migraciones (DevOps Programático)

### 6.1 Configuración Drizzle Kit (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.DIRECT_URL) {
  throw new Error('❌ DIRECT_URL is missing in .env');
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts", // Apunta al agregador
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL, // ¡CRUCIAL! Puerto 5432
  },
  verbose: true,
  strict: true,
});

```

### 6.2 Script de Migración Programático (`src/scripts/migrate.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigrate = async () => {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) throw new Error('❌ DIRECT_URL no definida');

  // max: 1 es importante para migraciones para evitar bloqueos
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('⏳ Iniciando migraciones...');
  
  try {
    // Verificar estado de migraciones previas
    const pending = await sql`
      SELECT * FROM drizzle_migrations 
      WHERE success = false
    `;
    
    if (pending.length > 0) {
      throw new Error(
        `❌ ${pending.length} migraciones fallidas detectadas. Rollback manual requerido.`
      );
    }

    await migrate(db, { migrationsFolder: 'src/lib/db/migrations' });
    console.log('✅ Migraciones completadas exitosamente');
  } catch (err) {
    console.error('❌ Error crítico en migración:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

runMigrate();

```

### 6.3 Estrategia de Rollback (Emergencias)

Drizzle no tiene rollback automático. En producción, **tratar rollbacks como migraciones hacia adelante**.

**Proceso Manual:**

1. **Identificar migración problemática:** `bun run db:studio` (Tabla: `__drizzle_migrations`)
2. **Crear migración de reversión (SQL):** Escribir `DROP TABLE...` o `ALTER TABLE...`
3. **Aplicar:** `bun run db:migrate`

**Prevención:** Probar siempre en Staging y usar transacciones en scripts SQL manuales.

---

## 7. Transacciones y Operaciones Atómicas

Para operaciones críticas (facturación, inventario, transferencias), Drizzle proporciona transacciones ACID que garantizan atomicidad: todas las operaciones se ejecutan o ninguna.

**Archivo:** `src/features/billing/billing.service.ts`

```typescript
import { db } from '~/lib/db/client';
import { subscriptions, invoices } from './billing.schema';
import { eq } from 'drizzle-orm';

export class BillingService {
  /**
   * Crea suscripción + factura de forma atómica
   * Si falla cualquier paso, rollback automático
   */
  static async createSubscription(userId: string, planId: string) {
    return await db.transaction(async (tx) => {
      // 1. Crear suscripción
      const [subscription] = await tx
        .insert(subscriptions)
        .values({
          userId,
          planId,
          status: 'active',
          startDate: new Date(),
        })
        .returning();

      // 2. Generar factura asociada (ATOMICIDAD: ambas o ninguna)
      await tx.insert(invoices).values({
        subscriptionId: subscription.id,
        amount: 4900, // 49€ en centavos
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
      });

      // 3. Si cualquier operación falla, TODO hace rollback automático
      return subscription;
    });
  }

  /**
   * Cancelar suscripción + anular facturas pendientes (Ejemplo de rollback)
   */
  static async cancelSubscription(subscriptionId: string) {
    return await db.transaction(async (tx) => {
      // 1. Actualizar estado de suscripción
      const [updated] = await tx
        .update(subscriptions)
        .set({ status: 'cancelled', cancelledAt: new Date() })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

      if (!updated) throw new Error('Suscripción no encontrada');

      // 2. Anular facturas pendientes
      await tx
        .update(invoices)
        .set({ status: 'void' })
        .where(
          eq(invoices.subscriptionId, subscriptionId),
          eq(invoices.status, 'pending')
        );

      return updated;
    });
  }
}
```

**Buenas Prácticas de Transacciones:**

1. **Mantenerlas cortas**: Evitar lógica pesada dentro del callback (bloquea DB)
2. **Manejo de errores**: Cualquier `throw` dentro hace rollback automático
3. **Evitar side-effects externos**: No llamar APIs de terceros dentro (pueden fallar después del commit)
4. **Uso de `returning()`**: Devuelve datos insertados/actualizados sin query adicional

---

## 8. Integración en Rutas: Protección y Datos

Cómo consumir esto de forma segura usando `sharedMap` (evitando llamadas dobles a Supabase).

**Archivo:** `src/routes/(app)/dashboard/index.tsx`

```typescript
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { AuthService } from '~/features/auth/auth.service'; // ✅ Usamos el servicio

export const useProfile = routeLoader$(async ({ sharedMap, error }) => {
  const user = sharedMap.get('user'); // ¡Garantizado por el layout!
  
  // ✅ CORRECTO: Delegamos en el servicio (Abstracción)
  // En lugar de llamar a db.query directamente aquí
  const profile = await AuthService.getProfile(user.id);
  
  if (!profile) throw error(404, 'Perfil no encontrado');
  return profile;
});

export default component$(() => {
  const profile = useProfile();
  return <h1>Hola, {profile.value.fullName}</h1>;
});

```

---

## 9. Scripts de Mantenimiento (`package.json`)

```json
"scripts": {
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  
  "db:migrate": "bun run src/scripts/migrate.ts",
  "types:supabase": "npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/lib/types/supabase.ts",
  
  "db:seed": "bun run src/scripts/seed.ts",
  "db:reset": "bun run db:push --force && bun run db:seed"
}

```

---

## 10. Red de Seguridad (SQL Triggers)

Copiar en Supabase SQL Editor para garantizar integridad referencial automática.

```sql
-- Trigger: Crear Perfil Automático al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

```

---

## 11. Troubleshooting Común

| Error | Causa Probable | Solución |
| --- | --- | --- |
| `prepared statement "..." already exists` | Falta configuración en cliente DB | Verificar `prepare: false` en `client.ts` |
| `relation "..." does not exist` (Migrate) | Usando puerto incorrecto | Verificar `DIRECT_URL` (Puerto 5432) en `drizzle.config.ts` |
| `column "..." does not exist` | Schema desincronizado | Ejecutar `db:generate` y luego `db:migrate` |
| `max client connections reached` | Pool saturado | Reducir `max` en prod (20->10) y revisar `max_lifetime` |
| Types `Database` not found | Falta generación | Ejecutar `bun run types:supabase` |
| `Cannot read property 'value' of undefined` | Loader ejecutado fuera de componente | Verificar que `useProfile()` esté dentro de `component$(() => {...})` |
| `Missing pgbouncer parameter` | URL sin Transaction Mode | Añadir `?pgbouncer=true` al final de `DATABASE_URL` |
| Transaction timeout | Operación bloqueante dentro de `db.transaction()` | Mover lógica pesada fuera del callback, mantener solo queries DB |