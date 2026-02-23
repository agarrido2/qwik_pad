-- ==========================================
-- AUTH.USERS TRIGGERS (requiere permisos elevados)
-- ==========================================
--
-- Este archivo contiene SOLO los triggers sobre auth.users.
-- No se puede ejecutar desde el SQL Editor de Supabase Dashboard
-- porque auth.users es propiedad de supabase_auth_admin.
--
-- OPCIONES DE INSTALACIÓN:
--
-- Opción 1 — Supabase CLI (recomendada):
--   supabase db push
--
-- Opción 2 — psql directo (Session Mode, puerto 5432):
--   psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" -f supabase/auth_triggers.sql
--
-- Opción 3 — Si los triggers YA existen de un setup anterior,
--   puedes verificarlo con:
--   SELECT tgname FROM pg_trigger t
--   JOIN pg_class c ON t.tgrelid = c.oid
--   JOIN pg_namespace n ON c.relnamespace = n.oid
--   WHERE n.nspname = 'auth' AND c.relname = 'users';
--
-- ==========================================

-- Asumir el rol dueño de auth.users
SET ROLE supabase_auth_admin;

-- Trigger: crear public.users al registrar un usuario
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Ejecuta handle_new_auth_user() después de crear un usuario en auth.users';

-- Trigger: limpiar public.users al eliminar un usuario
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_delete_auth_user();

COMMENT ON TRIGGER on_auth_user_deleted ON auth.users IS
  'Ejecuta handle_delete_auth_user() después de eliminar un usuario de auth.users';

-- Restaurar rol original
RESET ROLE;

-- Verificación rápida
DO $$
DECLARE cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'auth' AND c.relname = 'users'
    AND t.tgname IN ('on_auth_user_created', 'on_auth_user_deleted');
  RAISE NOTICE '✅ Triggers en auth.users: % / 2', cnt;
END $$;
