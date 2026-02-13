/**
 * Drizzle ORM Client (SERVER-ONLY)
 * @description Cliente de base de datos para Supabase con postgres-js.
 * 
 * Seguridad: este módulo vive en *.server.ts para evitar bundling accidental en el navegador.
 * Así, incluso si alguien importa por error desde UI, el build no debería incluir postgres/DATABASE_URL.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Crea una instancia del cliente de base de datos
 * @param connectionString - URL de conexión a la base de datos
 * @returns Instancia de Drizzle ORM con el schema tipado
 */
export function createDbClient(connectionString: string) {
  // Disable prefetch (prepare) - requerido para Transaction pool mode de Supabase
  const client = postgres(connectionString, { prepare: false });

  return drizzle(client, { schema });
}

/**
 * Tipo del cliente de base de datos
 */
export type DbClient = ReturnType<typeof createDbClient>;

/**
 * Helper para obtener el cliente desde el RequestEvent
 * 
 * Qwik Tip: manteniendo esto server-only, preservamos la resumibilidad O(1)
 * y evitamos que secretos/driver DB lleguen al bundle del cliente.
 */
export function getDb(requestEvent: { env?: { get?: (key: string) => string | undefined } }) {
  // En desarrollo (Vite), usar import.meta.env
  // En producción (con adapter), usar requestEvent.env.get()
  const connectionString = requestEvent.env?.get?.('DATABASE_URL') || import.meta.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. '
      + 'Check your .env file and ensure it follows the format: '
      + 'postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres'
    );
  }

  // Validar formato básico de la URL
  if (!connectionString.includes('pooler.supabase.com')) {
    console.warn(
      '[DB] ⚠️ DATABASE_URL does not contain "pooler.supabase.com". '
      + 'Ensure you are using the Transaction Pooler URL from Supabase, not the direct connection URL.'
    );
  }

  return createDbClient(connectionString);
}