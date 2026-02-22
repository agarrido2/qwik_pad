-- Alias de migración para mantener consistencia con drizzle/meta/_journal.json.
-- Contenido equivalente a 0002_add_auth_user_trigger.sql.

-- ==========================================
-- FUNCIÓN: handle_new_auth_user
-- ==========================================
-- Esta función se ejecuta automáticamente cuando se crea un nuevo usuario en auth.users
-- y replica los datos esenciales en public.users para nuestro modelo de negocio.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con permisos del dueño de la función
SET search_path = public
AS $$
BEGIN
  -- Insertar el nuevo usuario en public.users
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', NULL),
    NEW.raw_user_meta_data->>'avatar_url',
    'invited',
    true,
    'free',
    false, -- Por defecto, no ha completado onboarding
    'Europe/Madrid',
    'es',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- ==========================================
-- TRIGGER: on_auth_user_created
-- ==========================================
-- Se dispara DESPUÉS de insertar en auth.users

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ==========================================
-- COMENTARIOS (Documentación)
-- ==========================================

COMMENT ON FUNCTION public.handle_new_auth_user IS
'Trigger function que replica usuarios de auth.users a public.users automáticamente';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
'Auto-crea registro en public.users cuando se registra un nuevo usuario vía Supabase Auth';
