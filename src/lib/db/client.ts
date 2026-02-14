/**
 * Drizzle Database Client (Singleton Pattern)
 * 
 * Este archivo exporta una instancia única del cliente Drizzle.
 * Usa el patrón Singleton para evitar agotar conexiones durante Hot-Reload en dev.
 * 
 * Basado en: docs/standards/SUPABASE_DRIZZLE_MASTER.md
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ENV, isDev } from '../env.server';
import * as schema from './schema';

// ==========================================
// SINGLETON PATTERN
// ==========================================

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle> | undefined;
}

let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

if (isDev) {
  // En desarrollo: reutilizar conexión entre Hot-Reloads
  if (!global.__db) {
    client = postgres(ENV.DATABASE_URL, {
      max: 10, // Pool de conexiones en dev
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // CRÍTICO: Requerido para Supabase Transaction Pooler (pgbouncer)
    });
    global.__db = drizzle(client, { schema });
  }
  db = global.__db;
} else {
  // En producción: conexión normal
  client = postgres(ENV.DATABASE_URL, {
    max: 20, // Pool más grande en producción
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: false, // CRÍTICO: Requerido para Supabase Transaction Pooler (pgbouncer)
  });
  db = drizzle(client, { schema });
}

export { db };

// Exportar schema para uso en queries
export * from './schema';
