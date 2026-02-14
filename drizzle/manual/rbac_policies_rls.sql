-- ============================================================================
-- RBAC ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- Archivo: drizzle/manual/rbac_policies_rls.sql
-- Creado: 2026-02-14
-- Propósito: Políticas de seguridad a nivel de fila para multi-tenant RBAC
-- 
-- IMPORTANTE: Este archivo debe ejecutarse MANUALMENTE en Supabase SQL Editor
-- después de aplicar la migración 0004_orange_dracula.sql
--
-- Comando para aplicar migración antes de este script:
-- bun run db:push
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS EN TABLAS SENSIBLES
-- ============================================================================

-- Organizations: Solo miembros ven sus organizaciones
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organization Members: Solo miembros ven otros miembros de sus orgs
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Agent Profiles: Solo miembros de la org ven el perfil del agente
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;

-- Assigned Numbers: Solo miembros de la org ven los números asignados
ALTER TABLE assigned_numbers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. FUNCIÓN HELPER: Obtener organizaciones del usuario autenticado
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_organizations()
RETURNS TABLE(organization_id uuid, role text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id, role::text
  FROM organization_members
  WHERE user_id = auth.uid();
$$;

COMMENT ON FUNCTION public.user_organizations IS 
'Retorna las organizaciones y roles del usuario autenticado. 
Usado en políticas RLS para verificar pertenencia.';

-- ============================================================================
-- 3. FUNCIÓN HELPER: Verificar si usuario es owner de una organización
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_owner_of_org(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND role = 'owner'
  );
$$;

COMMENT ON FUNCTION public.is_owner_of_org IS
'Verifica si el usuario autenticado es owner de la organización especificada.
Usado para proteger rutas de facturación.';

-- ============================================================================
-- 4. FUNCIÓN HELPER: Verificar si usuario es admin o owner de una org
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin_or_owner(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND role IN ('owner', 'admin')
  );
$$;

COMMENT ON FUNCTION public.is_admin_or_owner IS
'Verifica si el usuario autenticado es admin u owner de la organización.
Usado para proteger rutas de gestión de usuarios y configuración.';

-- ============================================================================
-- 5. FUNCIÓN HELPER: Verificar si usuario es miembro de cualquier tipo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_member_of_org(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
  );
$$;

COMMENT ON FUNCTION public.is_member_of_org IS
'Verifica si el usuario autenticado pertenece a la organización (cualquier rol).
Usado para proteger datos específicos de la organización.';

-- ============================================================================
-- 6. POLÍTICAS RLS: organizations
-- ============================================================================

-- Política: Los usuarios solo ven organizaciones donde son miembros
CREATE POLICY "users_see_their_organizations"
ON organizations
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Política: Solo owners pueden actualizar datos de la organización
CREATE POLICY "owners_update_organizations"
ON organizations
FOR UPDATE
TO authenticated
USING (public.is_owner_of_org(id))
WITH CHECK (public.is_owner_of_org(id));

-- Política: Solo owners pueden eliminar la organización
CREATE POLICY "owners_delete_organizations"
ON organizations
FOR DELETE
TO authenticated
USING (public.is_owner_of_org(id));

-- ============================================================================
-- 7. POLÍTICAS RLS: organization_members
-- ============================================================================

-- Política: Los usuarios solo ven miembros de sus organizaciones
CREATE POLICY "users_see_org_members"
ON organization_members
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Política: Solo owners y admins pueden invitar nuevos miembros
CREATE POLICY "admins_invite_members"
ON organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_owner(organization_id)
  -- Restricción adicional: admins no pueden crear otros admins
  AND (
    role = 'member'
    OR (role IN ('owner', 'admin') AND public.is_owner_of_org(organization_id))
  )
);

-- Política: Solo owners y admins pueden actualizar roles
CREATE POLICY "admins_update_member_roles"
ON organization_members
FOR UPDATE
TO authenticated
USING (public.is_admin_or_owner(organization_id))
WITH CHECK (
  public.is_admin_or_owner(organization_id)
  -- Restricción: admins no pueden promover a admin
  AND (
    role = 'member'
    OR (role IN ('owner', 'admin') AND public.is_owner_of_org(organization_id))
  )
);

-- Política: Solo owners y admins pueden eliminar miembros
CREATE POLICY "admins_remove_members"
ON organization_members
FOR DELETE
TO authenticated
USING (
  public.is_admin_or_owner(organization_id)
  -- Restricción: no se puede auto-eliminar si eres el único owner
  AND (
    user_id != auth.uid()
    OR (
      SELECT COUNT(*) 
      FROM organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
        AND om.role = 'owner'
    ) > 1
  )
);

-- ============================================================================
-- 8. POLÍTICAS RLS: agent_profiles
-- ============================================================================

-- Política: Solo miembros de la org pueden ver el perfil del agente
CREATE POLICY "members_view_agent_profile"
ON agent_profiles
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Política: Solo owners y admins pueden modificar el perfil del agente
CREATE POLICY "admins_update_agent_profile"
ON agent_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_or_owner(organization_id))
WITH CHECK (public.is_admin_or_owner(organization_id));

-- ============================================================================
-- 9. POLÍTICAS RLS: assigned_numbers
-- ============================================================================

-- Política: Solo miembros de la org pueden ver números asignados
CREATE POLICY "members_view_assigned_numbers"
ON assigned_numbers
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Política: Solo owners y admins pueden asignar números
CREATE POLICY "admins_assign_numbers"
ON assigned_numbers
FOR UPDATE
TO authenticated
USING (public.is_admin_or_owner(organization_id))
WITH CHECK (public.is_admin_or_owner(organization_id));

-- ============================================================================
-- 10. FUNCIÓN DE AUDITORÍA: Registrar cambios de rol
-- ============================================================================

-- Tabla de auditoría (crear si no existe)
CREATE TABLE IF NOT EXISTS audit_role_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  target_user_id uuid NOT NULL REFERENCES users(id),
  changed_by_user_id uuid NOT NULL REFERENCES users(id),
  old_role user_role,
  new_role user_role NOT NULL,
  changed_at timestamp with time zone DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text
);

CREATE INDEX idx_audit_role_changes_org ON audit_role_changes(organization_id);
CREATE INDEX idx_audit_role_changes_target ON audit_role_changes(target_user_id);
CREATE INDEX idx_audit_role_changes_date ON audit_role_changes(changed_at);

-- Trigger para auditoría automática
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) OR TG_OP = 'INSERT' THEN
    INSERT INTO audit_role_changes (
      organization_id,
      target_user_id,
      changed_by_user_id,
      old_role,
      new_role
    ) VALUES (
      NEW.organization_id,
      NEW.user_id,
      auth.uid(),
      OLD.role,
      NEW.role
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar trigger a organization_members
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON organization_members;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- ============================================================================
-- 11. VERIFICACIÓN DE POLÍTICAS
-- ============================================================================

-- Query para verificar que todas las políticas están activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'organizations',
    'organization_members',
    'agent_profiles',
    'assigned_numbers'
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- 12. NOTAS DE IMPLEMENTACIÓN
-- ============================================================================

-- PERFORMANCE:
-- Las funciones helper usan SECURITY DEFINER para evitar bypass de RLS
-- Los índices creados en 0004_orange_dracula.sql optimizan estas queries

-- TESTING:
-- 1. Crear 2 orgs, 3 usuarios (user1=owner org1, user2=admin org1, user3=member org2)
-- 2. Verificar que user1 no ve datos de org2
-- 3. Verificar que user2 puede crear members pero no admins
-- 4. Verificar que user3 no puede modificar datos

-- ROLLBACK (en caso de emergencia):
-- DROP POLICY IF EXISTS "users_see_their_organizations" ON organizations;
-- DROP POLICY IF EXISTS "owners_update_organizations" ON organizations;
-- ... (repetir para cada política)
-- ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
-- ... (repetir para cada tabla)
