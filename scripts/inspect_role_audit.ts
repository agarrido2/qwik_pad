/**
 * Inspección puntual de trigger/function de auditoría de roles.
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL || '', { max: 1 });

const run = async () => {
  const table = await sql`
    SELECT to_regclass('public.audit_role_changes') AS table_name;
  `;

  const triggers = await sql`
    SELECT
      t.tgname,
      pg_get_triggerdef(t.oid) AS trigger_def
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND c.relname = 'organization_members'
      AND NOT t.tgisinternal;
  `;

  const fn = await sql`
    SELECT pg_get_functiondef(p.oid) AS function_def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'log_role_change';
  `;

  console.log('audit_role_changes:', table[0]?.table_name ?? null);
  console.log('organization_members triggers:', triggers);
  console.log('log_role_change exists:', fn.length > 0);
  if (fn.length > 0) console.log(fn[0].function_def);

  await sql.end();
};

run().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
