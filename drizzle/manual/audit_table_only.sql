-- ============================================================================
-- CREAR TABLA DE AUDITORÍA Y TRIGGER (FIX STANDALONE)
-- ============================================================================
-- Propósito: Resolver error "relation audit_role_changes does not exist"
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- 1. CREAR TABLA DE AUDITORÍA (si no existe)
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

-- 2. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audit_role_changes_org ON audit_role_changes(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_role_changes_target ON audit_role_changes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_role_changes_date ON audit_role_changes(changed_at);

-- 3. TRIGGER CORREGIDO (con fallback para operaciones server-side)
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
      COALESCE(auth.uid(), NEW.user_id),
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.role ELSE NULL END,
      NEW.role
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 4. APLICAR TRIGGER A organization_members
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON organization_members;
CREATE TRIGGER audit_role_changes_trigger
  AFTER INSERT OR UPDATE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();
