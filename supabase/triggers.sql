-- ==========================================
-- SUPABASE TRIGGERS & FUNCTIONS
-- Onucall SaaS - Database Automation
-- ==========================================
--
-- Este archivo contiene todas las funciones y triggers necesarios
-- para mantener la integridad referencial entre auth.users y public.users
--
-- INSTRUCCIONES DE INSTALACIÓN:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este archivo completo
-- 3. Ejecutar (Run)
-- 4. Verificar con: bun run scripts/verify_installation.ts
--
-- Última actualización: 2026-02-22
-- ==========================================

-- ==========================================
-- FUNCIÓN: handle_new_auth_user()
-- ==========================================
-- Descripción: Crea automáticamente un registro en public.users
--              cuando se crea un usuario en auth.users
-- Trigger: on_auth_user_created (AFTER INSERT on auth.users)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_full_name TEXT;
  user_avatar_url TEXT;
BEGIN
  -- Extraer full_name con fallback a 'name' (Google Auth)
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'fullName',
    NEW.raw_user_meta_data->>'name',
    NULL
  );

  -- Extraer avatar_url con fallback a 'picture' (Google Auth)
  user_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'avatarUrl',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Insertar en public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    role,
    is_active,
    subscription_tier,
    onboarding_completed,
    timezone,
    locale,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_avatar_url,
    'invited',              -- Estado inicial: requiere completar onboarding
    true,                   -- Usuario activo por defecto
    'free',                 -- Tier gratuito por defecto
    false,                  -- Onboarding pendiente
    'Europe/Madrid',        -- Timezone por defecto (España)
    'es',                   -- Locale por defecto (español)
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION public.handle_new_auth_user() IS 
'Trigger function: Crea automáticamente un registro en public.users cuando se registra un usuario via Supabase Auth. Soporta Google OAuth y email/password.';

-- ==========================================
-- TRIGGER: on_auth_user_created
-- ==========================================
-- auth.users es propiedad de supabase_auth_admin.
-- En el SQL Editor hosted, postgres no puede asumir ese rol.
-- Usamos un DO block con EXCEPTION para que el resto del script
-- siempre se ejecute. Si falla, aplicar via Supabase CLI:
--   supabase db push
-- o ejecutar SOLO el bloque auth en una conexión directa (port 5432).

DO $$
BEGIN
  CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();

  COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
    'Ejecuta handle_new_auth_user() después de crear un usuario en auth.users';

  RAISE NOTICE '✅ Trigger on_auth_user_created creado correctamente';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE '⚠️  on_auth_user_created: permiso denegado (auth.users). Aplicar via Supabase CLI o conexión directa.';
END $$;

-- ==========================================
-- FUNCIÓN: handle_updated_at()
-- ==========================================
-- Descripción: Actualiza automáticamente el campo updated_at
--              en cualquier tabla que lo use
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_updated_at() IS 
'Trigger function: Actualiza automáticamente el campo updated_at antes de cualquier UPDATE';

-- ==========================================
-- TRIGGERS: updated_at en tablas principales
-- ==========================================

-- Trigger para users
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para organizations
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para voice_agents
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON public.voice_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para phone_numbers
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para departments
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para calendar_schedules
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON public.calendar_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para appointments
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- FUNCIÓN: handle_delete_auth_user()
-- ==========================================
-- Descripción: Limpia registros en public.users cuando se
--              elimina un usuario de auth.users (CASCADE)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_delete_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Eliminar usuario de public.users
  -- Los FK cascades se encargarán del resto (organization_members, etc.)
  DELETE FROM public.users WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.handle_delete_auth_user() IS 
'Trigger function: Elimina automáticamente el usuario de public.users cuando se elimina de auth.users. Los foreign keys en cascade se encargan de limpiar referencias.';

-- Trigger para delete (requiere ownership de auth.users)
DO $$
BEGIN
  CREATE OR REPLACE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_delete_auth_user();

  COMMENT ON TRIGGER on_auth_user_deleted ON auth.users IS
    'Ejecuta handle_delete_auth_user() después de eliminar un usuario de auth.users';

  RAISE NOTICE '✅ Trigger on_auth_user_deleted creado correctamente';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE '⚠️  on_auth_user_deleted: permiso denegado (auth.users). Aplicar via Supabase CLI o conexión directa.';
END $$;

-- ==========================================
-- FUNCIÓN: user_organizations()
-- ==========================================
-- Descripción: Helper para obtener las organizaciones de un usuario
--              Usado en RLS policies y queries optimizadas
-- ==========================================

CREATE OR REPLACE FUNCTION public.user_organizations(user_id UUID)
RETURNS TABLE(organization_id UUID, role TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    organization_id,
    role::TEXT
  FROM public.organization_members
  WHERE user_id = $1;
$$;

COMMENT ON FUNCTION public.user_organizations(UUID) IS 
'Helper function: Retorna las organizaciones y roles de un usuario. Útil para RLS policies y queries optimizadas.';

-- ==========================================
-- TABLA: audit_role_changes
-- ==========================================
-- Descripción: Auditoría de cambios de rol en organization_members
-- ==========================================

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

-- ==========================================
-- FUNCIÓN: log_role_change()
-- ==========================================
-- Descripción: Registra cambios INSERT/UPDATE/DELETE en organization_members
-- ==========================================

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

COMMENT ON FUNCTION public.log_role_change() IS
'Trigger function: Registra auditoría de cambios de rol en organization_members para trazabilidad RBAC.';

CREATE OR REPLACE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

COMMENT ON TRIGGER audit_role_changes_trigger ON public.organization_members IS
'Audita cambios de rol en organization_members (INSERT/UPDATE/DELETE).';

-- ==========================================
-- VERIFICACIÓN DE INSTALACIÓN
-- ==========================================

DO $$
DECLARE
  function_count INTEGER;
  trigger_count INTEGER;
  updated_at_count INTEGER;
BEGIN
  -- Contar funciones creadas
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'handle_new_auth_user',
    'handle_updated_at',
    'handle_delete_auth_user',
    'user_organizations'
  );

  -- Contar triggers en auth.users
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND t.tgname IN ('on_auth_user_created', 'on_auth_user_deleted');

  -- Contar triggers set_updated_at en tablas públicas
  SELECT COUNT(*) INTO updated_at_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  AND t.tgname = 'set_updated_at'
  AND c.relname IN (
    'users', 'organizations', 'voice_agents',
    'phone_numbers', 'departments',
    'calendar_schedules', 'appointments'
  );

  -- Mostrar resultados
  RAISE NOTICE '';
  RAISE NOTICE '═════════════════════════════════════════════════';
  RAISE NOTICE '✅ INSTALACIÓN COMPLETADA';
  RAISE NOTICE '═════════════════════════════════════════════════';
  RAISE NOTICE 'Funciones creadas: % / 4', function_count;
  RAISE NOTICE 'Triggers en auth.users: % / 2', trigger_count;
  RAISE NOTICE 'Triggers set_updated_at: % / 7', updated_at_count;
  RAISE NOTICE '';

  IF function_count = 4 AND trigger_count = 2 AND updated_at_count = 7 THEN
    RAISE NOTICE '✅ Todas las funciones y triggers están correctamente instalados';
  ELSE
    RAISE NOTICE '⚠️  ADVERTENCIA: Algunas funciones/triggers pueden estar faltando';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Verificación completa con: bun run scripts/verify_installation.ts';
  RAISE NOTICE '═════════════════════════════════════════════════';
END $$;
