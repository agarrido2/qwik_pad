-- Fix: trigger de auditoría de roles debe soportar operaciones server-side sin JWT
-- Contexto: en flujos backend (ej. onboarding), auth.uid() puede ser NULL
-- y la columna audit_role_changes.changed_by_user_id es NOT NULL.
-- Solución: fallback a NEW.user_id cuando no exista actor autenticado en el contexto.

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
