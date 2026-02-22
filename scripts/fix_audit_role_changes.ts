/**
 * Fix runtime para auditoría RBAC:
 * - Crea tabla public.audit_role_changes si no existe
 * - Re-crea función public.log_role_change()
 * - Re-crea trigger audit_role_changes_trigger
 *
 * Uso: bun run scripts/fix_audit_role_changes.ts
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
  console.log('🔧 Aplicando fix para audit_role_changes...');

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS public.audit_role_changes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
      target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      changed_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      old_role public.user_role,
      new_role public.user_role NOT NULL,
      changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_role_changes_org
      ON public.audit_role_changes (organization_id);

    CREATE INDEX IF NOT EXISTS idx_audit_role_changes_target_user
      ON public.audit_role_changes (target_user_id);

    CREATE INDEX IF NOT EXISTS idx_audit_role_changes_changed_at
      ON public.audit_role_changes (changed_at DESC);

    CREATE OR REPLACE FUNCTION public.log_role_change()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_role_changes (
          organization_id,
          target_user_id,
          changed_by_user_id,
          old_role,
          new_role
        ) VALUES (
          NEW.organization_id,
          NEW.user_id,
          COALESCE(auth.uid(), NEW.user_id),
          NULL,
          NEW.role
        );
        RETURN NEW;
      END IF;

      IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO public.audit_role_changes (
          organization_id,
          target_user_id,
          changed_by_user_id,
          old_role,
          new_role
        ) VALUES (
          NEW.organization_id,
          NEW.user_id,
          COALESCE(auth.uid(), NEW.user_id),
          OLD.role,
          NEW.role
        );
        RETURN NEW;
      END IF;

      IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_role_changes (
          organization_id,
          target_user_id,
          changed_by_user_id,
          old_role,
          new_role
        ) VALUES (
          OLD.organization_id,
          OLD.user_id,
          COALESCE(auth.uid(), OLD.user_id),
          OLD.role,
          OLD.role
        );
        RETURN OLD;
      END IF;

      RETURN COALESCE(NEW, OLD);
    END;
    $$;

    DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.organization_members;
    CREATE TRIGGER audit_role_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
      FOR EACH ROW
      EXECUTE FUNCTION public.log_role_change();
  `);

  const check = await sql`
    SELECT
      to_regclass('public.audit_role_changes') AS table_name,
      EXISTS (
        SELECT 1
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND c.relname = 'organization_members'
          AND t.tgname = 'audit_role_changes_trigger'
      ) AS trigger_exists;
  `;

  console.log('✅ Resultado:', check[0]);
  await sql.end();
};

run().catch(async (error) => {
  console.error('❌ Error aplicando fix:', error);
  await sql.end();
  process.exit(1);
});
