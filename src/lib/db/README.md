# `src/lib/db`

Módulo de base de datos (Drizzle + Postgres en Supabase).

## Qué contiene

- `schema.ts`: **fuente de verdad** del schema Drizzle (tablas + enums).
- `client.server.ts`: creación del cliente Drizzle con `postgres-js` (**solo servidor**).
- `index.ts`: barrel export del módulo.

## Uso recomendado

En loaders/actions de Qwik City (server-side), usa `getDb(requestEvent)`:

```ts
import { getDb } from '~/lib/db/client.server';

export const useSomething = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent);
  // ... queries con drizzle
});
```

## Detalles importantes

- `createDbClient()` usa `postgres(connectionString, { prepare: false })` por compatibilidad con el **Transaction pooler** de Supabase.
- `getDb()` intenta leer `DATABASE_URL` desde `requestEvent.env.get()` (producción) y fallback a `import.meta.env.DATABASE_URL` (dev).

## Flujo recomendado (SQL-first con Supabase)

Este proyecto usa un enfoque **SQL-first** para cambios de base de datos:

- Los cambios estructurales (crear/modificar tablas, enums, funciones, triggers, RLS/policies, etc.) se hacen como **migraciones SQL manuales** en Supabase.
- Después, se reflejan esos cambios en `schema.ts` para mantener Drizzle (tipos/queries) alineado.
- Como verificación rápida, ejecuta `bun run build.types` tras actualizar `schema.ts`.

Notas:

- La carpeta `src/lib/db/migrations/meta/` contiene snapshots/journal usados por tooling de Drizzle; se recomienda **no editarla manualmente**.
- Evita usar `bun run db:generate` como “fuente de migraciones” si `meta/` no está alineado con el estado real de Supabase; si lo usas, revisa cuidadosamente el diff generado.

## Variables de entorno

- `DATABASE_URL`