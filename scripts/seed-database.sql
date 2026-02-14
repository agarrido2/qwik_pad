-- ============================================================================
-- SCRIPT DE SEED PARA DATABASE - QWIK PAD
-- ============================================================================
-- Propósito: Limpia y puebla la base de datos con datos ficticios para testing
-- 
-- IMPORTANTE: 
-- - Este script ELIMINA TODOS LOS DATOS existentes
-- - Crea 20 organizaciones
-- - Crea 100 usuarios con password "a123456"
-- - Asigna roles variados (owner/admin/member)
-- 
-- Uso:
--   psql -h [host] -d [database] -U [user] -f scripts/seed-database.sql
--   O ejecutar desde Supabase SQL Editor
-- 
-- Fecha: 2026-02-14
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PASO 1: LIMPIEZA DE DATOS (SOLO DATOS, NO ESTRUCTURA)
-- ============================================================================

BEGIN;

-- Desactivar temporalmente los triggers para evitar conflictos
SET session_replication_role = 'replica';

-- Limpiar tablas en orden (de hijos a padres para respetar FK)
TRUNCATE TABLE public.audit_role_changes CASCADE;
TRUNCATE TABLE public.agent_profiles CASCADE;
TRUNCATE TABLE public.assigned_numbers CASCADE;
TRUNCATE TABLE public.organization_members CASCADE;
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.organizations CASCADE;
TRUNCATE TABLE public.users_demo CASCADE;
TRUNCATE TABLE public.ip_trials CASCADE;
TRUNCATE TABLE public.call_flow_templates CASCADE;
TRUNCATE TABLE public.industry_types CASCADE;

-- Limpiar tablas de auth (sesiones, tokens, identities)
TRUNCATE TABLE auth.sessions CASCADE;
TRUNCATE TABLE auth.refresh_tokens CASCADE;
TRUNCATE TABLE auth.identities CASCADE;
TRUNCATE TABLE auth.mfa_factors CASCADE;
TRUNCATE TABLE auth.mfa_challenges CASCADE;
TRUNCATE TABLE auth.one_time_tokens CASCADE;
TRUNCATE TABLE auth.users CASCADE;

-- Reactivar triggers
SET session_replication_role = 'origin';

COMMIT;

-- ============================================================================
-- PASO 2: INSERCIÓN DE DATOS FICTICIOS
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 2.1: INDUSTRY TYPES (Base para organizaciones)
-- ----------------------------------------------------------------------------
INSERT INTO public.industry_types (id, slug, name, description, icon) VALUES
  (gen_random_uuid(), 'concesionario', 'Concesionario de Automóviles', 'Venta y postventa de vehículos', '🚗'),
  (gen_random_uuid(), 'inmobiliaria', 'Agencia Inmobiliaria', 'Compra, venta y alquiler de propiedades', '🏠'),
  (gen_random_uuid(), 'retail', 'Comercio Minorista', 'Tiendas y comercio al por menor', '🛒'),
  (gen_random_uuid(), 'alquiladora', 'Alquiler de Vehículos', 'Rent a car y servicios de movilidad', '🚙'),
  (gen_random_uuid(), 'sat', 'Servicio Técnico', 'Reparación y mantenimiento', '🔧');

-- ----------------------------------------------------------------------------
-- 2.2: USUARIOS (100 usuarios)
-- ----------------------------------------------------------------------------
-- Generamos un hash bcrypt válido para "a123456"
-- Hash: $2a$10$YourSaltHere... (Supabase lo generará automáticamente)

DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_name text;
  v_counter integer;
  v_encrypted_password text;
  v_names text[] := ARRAY[
    'Ana García', 'Carlos Martín', 'María López', 'Juan Rodríguez', 'Laura Sánchez',
    'Pedro Fernández', 'Carmen Gómez', 'José Díaz', 'Isabel Pérez', 'Antonio Ruiz',
    'Elena Torres', 'Francisco Ramírez', 'Rosa Moreno', 'Manuel Jiménez', 'Lucía Álvarez',
    'Miguel Romero', 'Pilar Navarro', 'Javier Muñoz', 'Teresa Alonso', 'Ángel Gutiérrez',
    'Dolores Hernández', 'Rafael Márquez', 'Concepción Domínguez', 'Enrique Vargas',
    'Amparo Castro', 'Vicente Ortiz', 'Montserrat Rubio', 'Andrés Serrano', 'Raquel Blanco',
    'Sergio Morales', 'Cristina Suárez', 'Pablo Molina', 'Beatriz Ortega', 'Alberto Delgado',
    'Silvia Ramírez', 'Jorge Vega', 'Marta Romero', 'Daniel Mendoza', 'Patricia Flores',
    'Rubén Herrera', 'Natalia Castro', 'Iván Medina', 'Sandra Guerrero', 'Óscar Cortés',
    'Verónica Núñez', 'Raúl Fuentes', 'Gloria Gil', 'Adrián Aguilar', 'Nuria Méndez',
    'Héctor Campos'
  ];
BEGIN
  -- Hash del password "a123456" usando crypt de pgcrypto
  -- Supabase usa bcrypt con cost 10
  v_encrypted_password := crypt('a123456', gen_salt('bf', 10));

  FOR v_counter IN 1..100 LOOP
    v_user_id := gen_random_uuid();
    v_email := 'user' || v_counter || '@onucall.test';
    
    -- Seleccionar nombre del array (con wrap-around)
    v_name := v_names[(v_counter - 1) % array_length(v_names, 1) + 1];
    
    -- Si superamos el array, añadir sufijo numérico
    IF v_counter > array_length(v_names, 1) THEN
      v_name := v_name || ' ' || (v_counter / array_length(v_names, 1))::text;
    END IF;

    -- Insertar en auth.users (tabla de autenticación de Supabase)
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      is_sso_user,
      deleted_at,
      is_anonymous
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_password,
      NOW(),
      NULL,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_name, 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || v_counter),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      false,
      NULL,
      false
    );

    -- El trigger handle_new_auth_user() ya creó el registro en public.users
    -- Actualizamos campos adicionales
    UPDATE public.users SET
      phone = '+34' || (600000000 + v_counter)::text,
      onboarding_completed = CASE 
        WHEN v_counter <= 80 THEN true  -- user1-user80
        ELSE false
      END,
      trial_ends_at = NOW() + INTERVAL '30 days',
      trial_started_at = NOW() - INTERVAL '5 days',
      signup_ip = '192.168.1.' || (v_counter % 255)::text,
      timezone = 'Europe/Madrid',
      locale = 'es',
      last_login = NOW() - (random() * INTERVAL '7 days')
    WHERE id = v_user_id;

  END LOOP;

  RAISE NOTICE 'Creados 100 usuarios con password "a123456"';
END $$;

-- ----------------------------------------------------------------------------
-- 2.3: ORGANIZACIONES (20 organizaciones)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_org_id uuid;
  v_counter integer;
  v_org_names text[] := ARRAY[
    'AutoStar Madrid',
    'Inmobiliaria Premium',
    'TechRetail Solutions',
    'RentCar Express',
    'SAT Tecnología',
    'Concesionario Elite',
    'Casas del Mediterráneo',
    'MegaStore Central',
    'MobilityRent',
    'Servicio Rápido 24h',
    'AutoNation Barcelona',
    'PropiedadesPlus',
    'SmartRetail Group',
    'FleetCar Alquiler',
    'TechService Pro',
    'MotorWorld',
    'Habitat Inmobiliario',
    'Comercial Sur',
    'EuroRent Vehicles',
    'Reparaciones Express'
  ];
  v_industries text[] := ARRAY[
    'concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat',
    'concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat',
    'concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat',
    'concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat'
  ];
  v_tiers text[] := ARRAY[
    'free', 'starter', 'pro', 'enterprise', 'starter',
    'free', 'pro', 'starter', 'free', 'starter',
    'pro', 'enterprise', 'starter', 'free', 'pro',
    'starter', 'free', 'pro', 'starter', 'enterprise'
  ];
BEGIN
  FOR v_counter IN 1..20 LOOP
    v_org_id := gen_random_uuid();

    INSERT INTO public.organizations (
      id,
      name,
      slug,
      subscription_tier,
      subscription_status,
      industry,
      phone,
      business_description,
      assistant_name,
      assistant_gender,
      assistant_kindness_level,
      assistant_friendliness_level,
      created_at,
      updated_at
    ) VALUES (
      v_org_id,
      v_org_names[v_counter],
      lower(regexp_replace(v_org_names[v_counter], '[^a-zA-Z0-9]', '-', 'g')),
      v_tiers[v_counter]::subscription_tier,
      'active'::subscription_status,
      v_industries[v_counter],
      '+34' || (900000000 + v_counter)::text,
      'Empresa líder en ' || v_industries[v_counter],
      CASE 
        WHEN v_counter % 2 = 0 THEN 'Laura'
        ELSE 'Carlos'
      END,
      CASE 
        WHEN v_counter % 2 = 0 THEN 'female'::assistant_gender
        ELSE 'male'::assistant_gender
      END,
      3 + (v_counter % 3), -- Nivel 3-5
      3 + (v_counter % 3), -- Nivel 3-5
      NOW() - (random() * INTERVAL '180 days'),
      NOW()
    );

  END LOOP;

  RAISE NOTICE 'Creadas 20 organizaciones';
END $$;

-- ----------------------------------------------------------------------------
-- 2.4: ORGANIZATION_MEMBERS (Asignar usuarios a organizaciones)
-- ----------------------------------------------------------------------------
-- Distribución:
-- - Cada org tiene: 1 owner + 1-2 admins + 2-3 members
-- - Total: ~100 usuarios distribuidos en 20 orgs (~5 por org)
DO $$
DECLARE
  v_org record;
  v_user record;
  v_users_cursor CURSOR FOR 
    SELECT id, email FROM public.users ORDER BY created_at;
  v_user_counter integer := 0;
  v_role user_role;
BEGIN
  -- Desactivar triggers de auditoría (log_role_change requiere auth.uid())
  SET session_replication_role = 'replica';

  FOR v_org IN SELECT id FROM public.organizations ORDER BY created_at LOOP
    v_user_counter := 0;

    FOR v_user IN v_users_cursor LOOP
      v_user_counter := v_user_counter + 1;

      -- Asignar rol basado en posición
      IF v_user_counter = 1 THEN
        v_role := 'owner';
      ELSIF v_user_counter <= 2 THEN
        v_role := 'admin';
      ELSIF v_user_counter <= 5 THEN
        v_role := 'member';
      ELSE
        EXIT; -- Siguiente organización
      END IF;

      -- Insertar membresía
      INSERT INTO public.organization_members (
        id,
        user_id,
        organization_id,
        role,
        joined_at
      ) VALUES (
        gen_random_uuid(),
        v_user.id,
        v_org.id,
        v_role,
        NOW() - (random() * INTERVAL '90 days')
      );

      -- Si completamos 5 usuarios, pasar a siguiente org
      IF v_user_counter >= 5 THEN
        EXIT;
      END IF;
    END LOOP;

  END LOOP;

  -- Reactivar triggers
  SET session_replication_role = 'origin';

  RAISE NOTICE 'Asignados usuarios a organizaciones con roles';
END $$;

-- ----------------------------------------------------------------------------
-- 2.5: AGENT_PROFILES (Perfiles de agente para algunos usuarios)
-- ----------------------------------------------------------------------------
-- Crear perfiles para los primeros 40 usuarios únicos (40% con perfil completo)
DO $$
DECLARE
  v_user record;
  v_industries public.industry_sector[] := ARRAY[
    'concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat'
  ];
BEGIN
  FOR v_user IN 
    -- DISTINCT ON para evitar duplicados (un usuario solo puede tener 1 perfil)
    SELECT DISTINCT ON (u.id) u.id, om.organization_id, o.industry
    FROM public.users u
    JOIN public.organization_members om ON om.user_id = u.id
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.role IN ('owner', 'admin')
    ORDER BY u.id, om.joined_at
    LIMIT 40
  LOOP
    INSERT INTO public.agent_profiles (
      user_id,
      organization_id,
      business_name,
      notification_email,
      website,
      handoff_phone,
      industry,
      agent_phone,
      business_description,
      leads_email,
      transfer_policy,
      assistant_gender,
      assistant_name,
      friendliness_level,
      warmth_level,
      created_at,
      updated_at
    ) VALUES (
      v_user.id,
      v_user.organization_id,
      'Negocio de ' || v_user.industry,
      'notificaciones@' || v_user.organization_id::text || '.test',
      'https://example-' || substring(v_user.organization_id::text, 1, 8) || '.com',
      '+34900' || floor(random() * 1000000)::text,
      v_user.industry::public.industry_sector,
      '+34910' || floor(random() * 1000000)::text,
      'Descripción del negocio especializado en ' || v_user.industry,
      'leads@' || v_user.organization_id::text || '.test',
      'Transferir llamadas urgentes al gerente',
      CASE WHEN random() > 0.5 THEN 'female'::assistant_gender ELSE 'male'::assistant_gender END,
      CASE WHEN random() > 0.5 THEN 'Asistente Laura' ELSE 'Asistente Carlos' END,
      floor(random() * 3 + 3)::integer, -- 3-5
      floor(random() * 3 + 3)::integer, -- 3-5
      NOW() - (random() * INTERVAL '60 days'),
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Creados 40 perfiles de agente';
END $$;

-- ----------------------------------------------------------------------------
-- 2.6: ASSIGNED_NUMBERS (Números asignados a algunas organizaciones)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_org record;
  v_counter integer := 0;
BEGIN
  FOR v_org IN 
    SELECT id, name 
    FROM public.organizations 
    WHERE subscription_tier IN ('starter', 'pro', 'enterprise')
    LIMIT 15
  LOOP
    v_counter := v_counter + 1;

    INSERT INTO public.assigned_numbers (
      id,
      phone_number,
      phone_number_formatted,
      prefix,
      location,
      user_id,
      organization_id,
      assigned_at,
      status,
      purchased_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '910' || lpad((200000 + v_counter)::text, 6, '0'),
      '+34 910 ' || lpad((200000 + v_counter)::text, 6, '0'),
      '+34',
      'Madrid',
      (SELECT om.user_id FROM organization_members om WHERE om.organization_id = v_org.id AND om.role = 'owner' LIMIT 1),
      v_org.id,
      NOW() - (random() * INTERVAL '30 days'),
      'active',
      NOW() - (random() * INTERVAL '60 days'),
      NOW() - (random() * INTERVAL '60 days'),
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Asignados 15 números de teléfono';
END $$;

-- ----------------------------------------------------------------------------
-- 2.7: USERS_DEMO (Usuarios de demo/trial)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_counter integer;
  v_statuses text[] := ARRAY['pending_verification', 'verified', 'converted', 'expired'];
  v_industries public.industry_sector[] := ARRAY['concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat'];
BEGIN
  FOR v_counter IN 1..30 LOOP
    INSERT INTO public.users_demo (
      id,
      name,
      email,
      phone,
      industry,
      ip_address,
      retell_call_id,
      duration_call,
      status,
      verified_at,
      verification_type,
      satisfaction,
      resource_origin,
      utm_campaign,
      utm_medium,
      created_at
    ) VALUES (
      gen_random_uuid(),
      'Demo Usuario ' || v_counter,
      'demo' || v_counter || '@test.com',
      '+34' || (650000000 + v_counter)::text,
      v_industries[(v_counter % 5) + 1],
      '203.0.113.' || (v_counter % 255)::text,
      'call_demo_' || v_counter,
      floor(random() * 300 + 60)::integer, -- 60-360 segundos
      v_statuses[(v_counter % 4) + 1],
      CASE WHEN v_counter % 3 = 0 THEN NOW() - (random() * INTERVAL '10 days') ELSE NULL END,
      'email_otp',
      floor(random() * 5 + 1)::integer, -- 1-5
      CASE WHEN v_counter % 3 = 0 THEN 'google_ads' WHEN v_counter % 3 = 1 THEN 'organic' ELSE 'direct' END,
      'trial_campaign_' || (v_counter % 3),
      CASE WHEN v_counter % 2 = 0 THEN 'cpc' ELSE 'organic' END,
      NOW() - (random() * INTERVAL '20 days')
    );
  END LOOP;

  RAISE NOTICE 'Creados 30 usuarios demo';
END $$;

COMMIT;

-- ============================================================================
-- PASO 3: VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  v_users_count integer;
  v_orgs_count integer;
  v_members_count integer;
  v_profiles_count integer;
BEGIN
  SELECT COUNT(*) INTO v_users_count FROM public.users;
  SELECT COUNT(*) INTO v_orgs_count FROM public.organizations;
  SELECT COUNT(*) INTO v_members_count FROM public.organization_members;
  SELECT COUNT(*) INTO v_profiles_count FROM public.agent_profiles;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEED COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Usuarios creados: %', v_users_count;
  RAISE NOTICE 'Organizaciones: %', v_orgs_count;
  RAISE NOTICE 'Membresías: %', v_members_count;
  RAISE NOTICE 'Perfiles de agente: %', v_profiles_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔑 PASSWORD UNIVERSAL: a123456';
  RAISE NOTICE '';
  RAISE NOTICE '📧 USUARIOS DE PRUEBA:';
  RAISE NOTICE '  - user1@onucall.test (owner de primera org)';
  RAISE NOTICE '  - user2@onucall.test (admin de primera org)';
  RAISE NOTICE '  - user3@onucall.test (member de primera org)';
  RAISE NOTICE '';
  RAISE NOTICE '🏢 ORGANIZACIONES:';
  RAISE NOTICE '  - 20 organizaciones con diferentes tiers';
  RAISE NOTICE '  - Cada org tiene: 1 owner + 1 admin + 2-3 members';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- CONSULTAS DE VERIFICACIÓN ÚTILES
-- ============================================================================

-- Ver distribución de usuarios por organización
-- SELECT 
--   o.name,
--   COUNT(*) as total_members,
--   SUM(CASE WHEN om.role = 'owner' THEN 1 ELSE 0 END) as owners,
--   SUM(CASE WHEN om.role = 'admin' THEN 1 ELSE 0 END) as admins,
--   SUM(CASE WHEN om.role = 'member' THEN 1 ELSE 0 END) as members
-- FROM organizations o
-- LEFT JOIN organization_members om ON om.organization_id = o.id
-- GROUP BY o.id, o.name
-- ORDER BY o.name;

-- Ver usuarios con sus organizaciones y roles
-- SELECT 
--   u.email,
--   u.full_name,
--   o.name as organization,
--   om.role
-- FROM users u
-- JOIN organization_members om ON om.user_id = u.id
-- JOIN organizations o ON o.id = om.organization_id
-- ORDER BY o.name, om.role;
