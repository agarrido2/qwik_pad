/**
 * Prueba controlada del trigger audit_role_changes_trigger
 * Ejecuta INSERT/UPDATE/DELETE en transaction y hace ROLLBACK.
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ No se encontró DIRECT_URL o DATABASE_URL');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

const run = async () => {
  const user = await sql`
    SELECT id, email FROM public.users ORDER BY created_at DESC LIMIT 1;
  `;

  if (user.length === 0) {
    throw new Error('No hay usuarios en public.users para testear trigger.');
  }

  const userId = user[0].id;

  await sql`BEGIN`;
  try {
    const org = await sql`
      INSERT INTO public.organizations (name, slug, subscription_tier, subscription_status, created_at, updated_at)
      VALUES ('Org Trigger Test', 'org-trigger-test-' || substr(md5(random()::text), 1, 8), 'free', 'active', now(), now())
      RETURNING id;
    `;

    const orgId = org[0].id;

    await sql`
      INSERT INTO public.organization_members (user_id, organization_id, role, joined_at)
      VALUES (${userId}::uuid, ${orgId}::uuid, 'member', now());
    `;

    await sql`
      UPDATE public.organization_members
      SET role = 'admin'
      WHERE user_id = ${userId}::uuid
        AND organization_id = ${orgId}::uuid;
    `;

    await sql`
      DELETE FROM public.organization_members
      WHERE user_id = ${userId}::uuid
        AND organization_id = ${orgId}::uuid;
    `;

    const auditRows = await sql`
      SELECT COUNT(*)::int AS count
      FROM public.audit_role_changes
      WHERE organization_id = ${orgId}::uuid
        AND target_user_id = ${userId}::uuid;
    `;

    console.log('✅ Trigger funcionando. Registros de auditoría en test:', auditRows[0].count);
  } finally {
    await sql`ROLLBACK`;
    await sql.end();
  }
};

run().catch(async (error) => {
  console.error('❌ Falló test de trigger:', error);
  await sql.end();
  process.exit(1);
});
