-- ============================================================================
-- MANUAL EXTRAS: 0012_scheduling_extras
-- Depende de: 0012_steep_rhino.sql (debe aplicarse después)
-- Contiene SOLO lo que Drizzle ORM no puede generar automáticamente:
--   1. Extensión btree_gist + Constraint GIST (anti-double-booking)
--   2. Índice PARCIAL WHERE status = 'CONFIRMED'
--   3. Constraints CHECK de validación JSONB
--   4. Triggers updated_at
--   5. Row Level Security (RLS) policies
-- ============================================================================

-- ============================================================================
-- 1. CONSTRAINT GIST: Anti-Double-Booking
-- Garantiza que dos citas CONFIRMED nunca se solapen en el mismo department.
-- Solo afecta a citas CONFIRMED (PENDING y CANCELLED no bloquean huecos).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "appointments"
  ADD CONSTRAINT "no_overlapping_confirmed_appointments"
  EXCLUDE USING GIST (
    "department_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
  )
  WHERE ("status" = 'CONFIRMED');

-- ============================================================================
-- 2. ÍNDICE PARCIAL: Solo citas CONFIRMED
-- Más pequeño y rápido que un índice total. CANCELLED/PENDING no impactan.
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_appointments_confirmed"
  ON "appointments" ("department_id", "start_at", "end_at")
  WHERE "status" = 'CONFIRMED';

-- ============================================================================
-- 3. CONSTRAINTS CHECK: Validación JSONB
-- Drizzle no soporta CHECK constraints nativos en el schema.
-- ============================================================================

ALTER TABLE "calendar_schedules"
  ADD CONSTRAINT "chk_weekly_hours_is_object"
  CHECK (jsonb_typeof("weekly_hours") = 'object');

ALTER TABLE "calendar_exceptions"
  ADD CONSTRAINT "chk_custom_hours_is_array"
  CHECK ("custom_hours" IS NULL OR jsonb_typeof("custom_hours") = 'array');

-- ============================================================================
-- 4. TRIGGERS: updated_at automático
-- NOTA: La función handle_updated_at() y los triggers de calendar_schedules
-- y appointments están en supabase/triggers.sql (aplicar ese archivo completo).
-- Este bloque es un recordatorio, NO ejecutar si ya se aplicó triggers.sql.
-- ============================================================================

-- Los triggers se gestionan en supabase/triggers.sql:
--   DROP TRIGGER IF EXISTS set_updated_at ON public.calendar_schedules;
--   CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.calendar_schedules ...
--   DROP TRIGGER IF EXISTS set_updated_at ON public.appointments;
--   CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.appointments ...

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Aislamiento hard multi-tenant: cada organización solo ve sus datos.
-- Los RPCs (get_time_window_availability, book_appointment) usan
-- SECURITY DEFINER con validación manual del organization_id vía JWT.
-- ============================================================================

ALTER TABLE "department_members"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calendar_schedules"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calendar_exceptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "appointments"        ENABLE ROW LEVEL SECURITY;

-- department_members: el usuario solo ve departamentos de su organización
CREATE POLICY "org_isolation_department_members" ON "department_members"
  USING (
    "department_id" IN (
      SELECT d.id FROM "departments" d
      INNER JOIN "organization_members" om ON om.organization_id = d.org_id
      WHERE om.user_id = auth.uid()
    )
  );

-- appointments: el usuario solo ve citas de su organización
CREATE POLICY "org_isolation_appointments" ON "appointments"
  USING (
    "organization_id" IN (
      SELECT organization_id FROM "organization_members"
      WHERE user_id = auth.uid()
    )
  );

-- calendar_schedules: accesible si el target_id pertenece a la org del usuario,
-- o es la propia organización, o es el propio usuario (calendario personal)
CREATE POLICY "org_isolation_calendar_schedules" ON "calendar_schedules"
  USING (
    "target_id" IN (
      SELECT d.id FROM "departments" d
      INNER JOIN "organization_members" om ON om.organization_id = d.org_id
      WHERE om.user_id = auth.uid()
    )
    OR "target_id" IN (
      SELECT organization_id FROM "organization_members" WHERE user_id = auth.uid()
    )
    OR "target_id" = auth.uid()
  );

-- calendar_exceptions: misma lógica que calendar_schedules
CREATE POLICY "org_isolation_calendar_exceptions" ON "calendar_exceptions"
  USING (
    "target_id" IN (
      SELECT d.id FROM "departments" d
      INNER JOIN "organization_members" om ON om.organization_id = d.org_id
      WHERE om.user_id = auth.uid()
    )
    OR "target_id" IN (
      SELECT organization_id FROM "organization_members" WHERE user_id = auth.uid()
    )
    OR "target_id" = auth.uid()
  );
