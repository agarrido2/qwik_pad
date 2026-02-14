-- ============================================================================
-- SCRIPT DE VERIFICACIÓN DE SEED (SUPABASE COMPATIBLE)
-- ============================================================================
-- Propósito: Verificar que el seed se ejecutó correctamente
-- Uso: Ejecutar después de seed-database.sql desde Supabase Dashboard
-- Nota: Compatible con Supabase SQL Editor (sin comandos \x, \echo)
-- ============================================================================

-- ============================================================================
-- 1. RESUMEN GENERAL
-- ============================================================================

SELECT '📊 RESUMEN GENERAL' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  'Usuarios (auth.users)' as "Tabla",
  COUNT(*)::text || ' registros' as "Cantidad"
FROM auth.users
UNION ALL
SELECT 
  'Usuarios (public.users)',
  COUNT(*)::text || ' registros'
FROM public.users
UNION ALL
SELECT 
  'Organizaciones',
  COUNT(*)::text || ' registros'
FROM public.organizations
UNION ALL
SELECT 
  'Membresías',
  COUNT(*)::text || ' registros'
FROM public.organization_members
UNION ALL
SELECT 
  'Perfiles de Agente',
  COUNT(*)::text || ' registros'
FROM public.agent_profiles
UNION ALL
SELECT 
  'Números Asignados',
  COUNT(*)::text || ' registros'
FROM public.assigned_numbers
UNION ALL
SELECT 
  'Usuarios Demo',
  COUNT(*)::text || ' registros'
FROM public.users_demo
UNION ALL
SELECT 
  'Industry Types',
  COUNT(*)::text || ' registros'
FROM public.industry_types;

-- ============================================================================
-- 2. DISTRIBUCIÓN POR ORGANIZACIÓN
-- ============================================================================

SELECT '🏢 DISTRIBUCIÓN POR ORGANIZACIÓN' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  o.name as "Organización",
  o.subscription_tier as "Tier",
  COUNT(om.id) as "Total Miembros",
  SUM(CASE WHEN om.role = 'owner' THEN 1 ELSE 0 END) as "Owners",
  SUM(CASE WHEN om.role = 'admin' THEN 1 ELSE 0 END) as "Admins",
  SUM(CASE WHEN om.role = 'member' THEN 1 ELSE 0 END) as "Members"
FROM public.organizations o
LEFT JOIN public.organization_members om ON om.organization_id = o.id
GROUP BY o.id, o.name, o.subscription_tier
ORDER BY o.name;

-- ============================================================================
-- 3. PRIMEROS 10 USUARIOS CON SUS ORGS
-- ============================================================================

SELECT '👥 PRIMEROS 10 USUARIOS' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  u.email as "Email",
  u.full_name as "Nombre",
  o.name as "Organización",
  om.role as "Rol",
  CASE WHEN u.onboarding_completed THEN '✓' ELSE '✗' END as "Onboarding"
FROM public.users u
JOIN public.organization_members om ON om.user_id = u.id
JOIN public.organizations o ON o.id = om.organization_id
ORDER BY o.name, 
  CASE om.role 
    WHEN 'owner' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'member' THEN 3
  END
LIMIT 10;

-- ============================================================================
-- 4. NÚMEROS ASIGNADOS
-- ============================================================================

SELECT '📞 NÚMEROS ASIGNADOS' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  o.name as "Organización",
  an.phone_number_formatted as "Número",
  an.status as "Estado",
  u.full_name as "Asignado a"
FROM public.assigned_numbers an
JOIN public.organizations o ON o.id = an.organization_id
LEFT JOIN public.users u ON u.id = an.user_id
ORDER BY o.name;

-- ============================================================================
-- 5. DISTRIBUCIÓN DE ROLES
-- ============================================================================

SELECT '🎯 DISTRIBUCIÓN DE ROLES' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  om.role as "Rol",
  COUNT(*) as "Cantidad",
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM organization_members)::numeric) * 100, 1)::text || '%' as "Porcentaje"
FROM public.organization_members om
GROUP BY om.role
ORDER BY 
  CASE om.role 
    WHEN 'owner' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'member' THEN 3
  END;

-- ============================================================================
-- 6. DISTRIBUCIÓN DE SUBSCRIPTION TIERS
-- ============================================================================

SELECT '💰 DISTRIBUCIÓN DE SUBSCRIPTION TIERS' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  subscription_tier as "Tier",
  COUNT(*) as "Organizaciones",
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM organizations)::numeric) * 100, 1)::text || '%' as "Porcentaje"
FROM public.organizations
GROUP BY subscription_tier
ORDER BY 
  CASE subscription_tier
    WHEN 'enterprise' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'starter' THEN 3
    WHEN 'free' THEN 4
  END;

-- ============================================================================
-- 7. VERIFICACIÓN DE AUTENTICACIÓN
-- ============================================================================

SELECT '🔐 VERIFICACIÓN DE AUTENTICACIÓN' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  'Usuarios en auth.users' as "Check Type",
  COUNT(*)::text as "Count"
FROM auth.users
UNION ALL
SELECT 
  'Usuarios en public.users',
  COUNT(*)::text
FROM public.users
UNION ALL
SELECT 
  'Usuarios con password hasheado',
  COUNT(*)::text
FROM auth.users
WHERE encrypted_password IS NOT NULL AND encrypted_password LIKE '$2a$10$%';

-- ============================================================================
-- 8. USUARIOS DE PRUEBA RECOMENDADOS
-- ============================================================================

SELECT '✅ USUARIOS DE PRUEBA RECOMENDADOS' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  u.email as "Email",
  u.full_name as "Nombre",
  o.name as "Organización",
  om.role as "Rol",
  '🔑 Password: a123456' as "Credenciales"
FROM public.users u
JOIN public.organization_members om ON om.user_id = u.id
JOIN public.organizations o ON o.id = om.organization_id
WHERE u.email IN ('user1@onucall.test', 'user2@onucall.test', 'user3@onucall.test', 'user4@onucall.test', 'user5@onucall.test')
ORDER BY o.name, 
  CASE om.role 
    WHEN 'owner' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'member' THEN 3
  END;

-- ============================================================================
-- 9. INSTRUCCIONES DE TESTING
-- ============================================================================

SELECT '🧪 INSTRUCCIONES DE TESTING' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  '1. Login como OWNER' as "Test Case",
  'user1@onucall.test' as "Email",
  'a123456' as "Password",
  'Dashboard, Usuarios, Facturación' as "Debe Ver"
UNION ALL
SELECT 
  '2. Login como ADMIN',
  'user2@onucall.test',
  'a123456',
  'Dashboard, Usuarios (NO Facturación)'
UNION ALL
SELECT 
  '3. Login como MEMBER',
  'user3@onucall.test',
  'a123456',
  'Solo Dashboard (sin gestión)';

-- ============================================================================
-- 10. RESUMEN FINAL
-- ============================================================================

SELECT '✨ VERIFICACIÓN COMPLETADA' as "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

SELECT 
  'Total Usuarios' as "Métrica",
  COUNT(*)::text as "Valor"
FROM public.users
UNION ALL
SELECT 
  'Total Organizaciones',
  COUNT(*)::text
FROM public.organizations
UNION ALL
SELECT 
  'Total Membresías',
  COUNT(*)::text
FROM public.organization_members
UNION ALL
SELECT 
  'Password Universal',
  'a123456'
UNION ALL
SELECT 
  'Status',
  '✅ Seed ejecutado correctamente';
