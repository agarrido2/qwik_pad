/**
 * db-wipe.ts
 * ─────────────────────────────────────────────────────────
 * Elimina TODOS los datos de las tablas public.* y auth.users.
 * NO elimina el schema, los enums, las funciones ni los triggers.
 *
 * Uso: bun run scripts/db-wipe.ts
 *
 * ⚠️  IRREVERSIBLE — ejecutar solo en desarrollo / demos.
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DIRECT_URL = process.env.DIRECT_URL;
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DIRECT_URL) {
  console.error('❌  DIRECT_URL no definida en .env.local');
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no definidos');
  process.exit(1);
}

// ── Confirmación de seguridad ──────────────────────────────────────────────
const confirm = process.argv[2];
if (confirm !== '--confirm') {
  console.log('');
  console.log('⚠️  OPERACIÓN DESTRUCTIVA: se eliminará TODO el contenido de la base de datos.');
  console.log('');
  console.log('   Vuelve a ejecutar con el flag --confirm para proceder:');
  console.log('   bun run scripts/db-wipe.ts --confirm');
  console.log('');
  process.exit(0);
}

// ── Borrado de tablas public.* ─────────────────────────────────────────────
// Orden respetando FK constraints (hijos antes que padres):
// Nivel 5 → Nivel 4 → ... → Nivel 1
const TABLE_ORDER = [
  // Nivel 5: tablas hoja (sin hijos)
  'audit_role_changes',      // → organizations, users
  'department_members',      // → departments, users
  'contacts',                // → organizations, voice_agents
  'appointments',            // → organizations, departments, users
  'calendar_exceptions',     // → (target_id, no FK explícita en schema)
  'calendar_schedules',      // → (target_id, no FK explícita en schema)
  'pending_invitations',     // → organizations, users
  'users_demo',              // → organizations (nullable)
  'ip_trials',               // sin FK

  // Nivel 4
  'organization_members',    // → organizations, users
  'departments',             // → organizations

  // Nivel 3
  'phone_numbers',           // → organizations, voice_agents
  'voice_agents',            // → organizations, users

  // Nivel 2
  'call_flow_templates',     // sin FK
  'organizations',           // root

  // Nivel 1 — users se borra por último en DB (auth.users lo hace cascada)
  'users',
];

const sql = postgres(DIRECT_URL, { max: 1 });

try {
  console.log('');
  console.log('🗑️  Iniciando borrado de tablas public.*…');
  console.log('');

  // Desactivar triggers para evitar conflictos de orden durante el TRUNCATE
  await sql`SET session_replication_role = replica`;

  for (const table of TABLE_ORDER) {
    await sql.unsafe(`TRUNCATE TABLE public."${table}" RESTART IDENTITY CASCADE`);
    console.log(`   ✅  public.${table} vacía`);
  }

  // Reactivar triggers
  await sql`SET session_replication_role = DEFAULT`;

  console.log('');
  console.log('🗑️  Eliminando usuarios de auth.users via Admin API…');
  console.log('');

  // Listar todos los usuarios de auth via Supabase Admin REST API
  let page = 1;
  let totalDeleted = 0;

  while (true) {
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!listRes.ok) {
      const err = await listRes.text();
      throw new Error(`Error listando auth.users: ${err}`);
    }

    const data = (await listRes.json()) as { users: Array<{ id: string }> };
    const users = data.users ?? [];

    if (users.length === 0) break;

    // Eliminar cada usuario
    for (const user of users) {
      const delRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        },
      );

      if (!delRes.ok) {
        const err = await delRes.text();
        console.warn(`   ⚠️  No se pudo eliminar auth.user ${user.id}: ${err}`);
      } else {
        totalDeleted++;
      }
    }

    // Si devolvió menos de 1000, no hay más páginas
    if (users.length < 1000) break;
    page++;
  }

  console.log(`   ✅  ${totalDeleted} usuario(s) eliminado(s) de auth.users`);
  console.log('');
  console.log('════════════════════════════════════════════════');
  console.log('🎉  Base de datos limpia.');
  console.log('    Schema, enums, funciones y triggers intactos.');
  console.log('════════════════════════════════════════════════');
  console.log('');
} catch (err) {
  console.error('❌  Error durante el borrado:', err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
