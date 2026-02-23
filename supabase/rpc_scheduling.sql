-- ============================================================================
-- RPC: SCHEDULING ENGINE
-- Onucall SaaS — Motor de Disponibilidad y Reservas
-- ============================================================================
--
-- INSTRUCCIONES DE APLICACIÓN:
-- 1. Ir a Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar este archivo completo
-- 3. Ejecutar (Run)
--
-- DEPENDENCIAS (deben existir antes de ejecutar este archivo):
--   - Tabla: departments (con slot_duration_minutes, buffer_before_minutes, buffer_after_minutes)
--   - Tabla: calendar_schedules
--   - Tabla: calendar_exceptions
--   - Tabla: appointments (con constraint GIST de 0012_scheduling_extras.sql)
--   - Enums: calendar_target_type, appointment_status, assignment_mode
--
-- Última actualización: 2026-02-22
-- ============================================================================


-- ============================================================================
-- RPC 1: get_time_window_availability
-- Motor de disponibilidad: triple intersección Org ∩ Dept ∩ User
-- ============================================================================
--
-- Devuelve un JSONB con todos los huecos disponibles del rango solicitado:
-- {
--   "2026-03-03": ["09:00", "09:30", "11:00"],
--   "2026-03-04": [],
--   "2026-03-05": ["10:00", "10:30"]
-- }
--
-- Los huecos vacíos [] indican día cerrado (festivo, fin de semana, excepción).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_time_window_availability(
  p_organization_id  UUID,
  p_department_id    UUID,
  p_user_id          UUID    DEFAULT NULL,
  p_start_date       DATE    DEFAULT CURRENT_DATE,
  p_end_date         DATE    DEFAULT CURRENT_DATE + 7,
  p_client_timezone  TEXT    DEFAULT 'Europe/Madrid'
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  -- Configuración del departamento
  v_slot_duration   INTEGER;
  v_buffer_before   INTEGER;
  v_buffer_after    INTEGER;
  v_dept_timezone   TEXT;

  -- Calendarios base (weekly_hours)
  v_org_schedule    JSONB;
  v_dept_schedule   JSONB;
  v_user_schedule   JSONB;

  -- Iteración diaria
  v_day             DATE;
  v_isodow          INTEGER;

  -- Excepciones del día
  v_org_ex_closed   BOOLEAN;
  v_org_ex_hours    JSONB;
  v_dept_ex_closed  BOOLEAN;
  v_dept_ex_hours   JSONB;
  v_user_ex_closed  BOOLEAN;
  v_user_ex_hours   JSONB;

  -- Horas efectivas para el día (resultado del COALESCE excepción/patrón)
  v_org_hours       JSONB;
  v_dept_hours      JSONB;
  v_user_hours      JSONB;

  -- Generación de slots
  v_slot_start      TIMESTAMPTZ;
  v_slot_end        TIMESTAMPTZ;
  v_period_start    TIMESTAMPTZ;
  v_period_end      TIMESTAMPTZ;
  v_slots           JSONB;
  v_time_str        TEXT;
  v_is_blocked      BOOLEAN;
  v_period_elem     JSONB;

  -- Resultado final
  v_result          JSONB := '{}'::JSONB;
BEGIN

  -- 1. Validar que el rango no supere 30 días (anti-abuso)
  IF (p_end_date - p_start_date) > 30 THEN
    RAISE EXCEPTION 'Rango máximo permitido: 30 días (solicitado: % días)', (p_end_date - p_start_date);
  END IF;

  IF p_start_date > p_end_date THEN
    RAISE EXCEPTION 'p_start_date debe ser anterior o igual a p_end_date';
  END IF;

  -- 2. Leer configuración del departamento
  SELECT
    d.slot_duration_minutes,
    COALESCE(d.buffer_before_minutes, 0),
    COALESCE(d.buffer_after_minutes, 0),
    COALESCE(cs.timezone, 'Europe/Madrid')
  INTO
    v_slot_duration,
    v_buffer_before,
    v_buffer_after,
    v_dept_timezone
  FROM departments d
  LEFT JOIN calendar_schedules cs
    ON cs.target_type = 'DEPARTMENT' AND cs.target_id = d.id
  WHERE d.id = p_department_id
    AND d.is_active = true;

  -- Si el departamento no existe o está inactivo → vacío
  IF NOT FOUND OR v_slot_duration IS NULL THEN
    RETURN '{}'::JSONB;
  END IF;

  -- 3. Leer patrones semanales de cada entidad (una query por entidad)
  SELECT weekly_hours INTO v_org_schedule
  FROM calendar_schedules
  WHERE target_type = 'ORGANIZATION' AND target_id = p_organization_id;

  SELECT weekly_hours INTO v_dept_schedule
  FROM calendar_schedules
  WHERE target_type = 'DEPARTMENT' AND target_id = p_department_id;

  IF p_user_id IS NOT NULL THEN
    SELECT weekly_hours INTO v_user_schedule
    FROM calendar_schedules
    WHERE target_type = 'USER' AND target_id = p_user_id;
  END IF;

  -- 4. Iterar sobre cada día del rango
  FOR v_day IN
    SELECT gs::DATE
    FROM generate_series(p_start_date::TIMESTAMPTZ, p_end_date::TIMESTAMPTZ, '1 day'::INTERVAL) gs
  LOOP
    v_isodow := EXTRACT(ISODOW FROM v_day)::INTEGER;
    v_slots  := '[]'::JSONB;

    -- -------------------------------------------------------------------------
    -- 5. Resolver horario efectivo de la ORGANIZACIÓN para este día
    -- -------------------------------------------------------------------------
    SELECT
      ce.is_closed,
      ce.custom_hours
    INTO v_org_ex_closed, v_org_ex_hours
    FROM calendar_exceptions ce
    WHERE ce.target_type = 'ORGANIZATION'
      AND ce.target_id = p_organization_id
      AND ce.exception_date = v_day;

    IF FOUND THEN
      IF v_org_ex_closed THEN
        v_result := v_result || jsonb_build_object(v_day::TEXT, '[]'::JSONB);
        CONTINUE;
      ELSIF v_org_ex_hours IS NOT NULL THEN
        v_org_hours := v_org_ex_hours;
      ELSE
        v_org_hours := COALESCE(v_org_schedule->(v_isodow::TEXT), '[]'::JSONB);
      END IF;
    ELSE
      v_org_hours := COALESCE(v_org_schedule->(v_isodow::TEXT), '[]'::JSONB);
    END IF;

    -- Org cerrada este día → slot vacío
    IF v_org_hours IS NULL OR jsonb_array_length(v_org_hours) = 0 THEN
      v_result := v_result || jsonb_build_object(v_day::TEXT, '[]'::JSONB);
      CONTINUE;
    END IF;

    -- -------------------------------------------------------------------------
    -- 6. Resolver horario efectivo del DEPARTAMENTO para este día
    -- -------------------------------------------------------------------------
    SELECT
      ce.is_closed,
      ce.custom_hours
    INTO v_dept_ex_closed, v_dept_ex_hours
    FROM calendar_exceptions ce
    WHERE ce.target_type = 'DEPARTMENT'
      AND ce.target_id = p_department_id
      AND ce.exception_date = v_day;

    IF FOUND THEN
      IF v_dept_ex_closed THEN
        v_result := v_result || jsonb_build_object(v_day::TEXT, '[]'::JSONB);
        CONTINUE;
      ELSIF v_dept_ex_hours IS NOT NULL THEN
        v_dept_hours := v_dept_ex_hours;
      ELSE
        v_dept_hours := COALESCE(v_dept_schedule->(v_isodow::TEXT), '[]'::JSONB);
      END IF;
    ELSE
      v_dept_hours := COALESCE(v_dept_schedule->(v_isodow::TEXT), '[]'::JSONB);
    END IF;

    -- Dept cerrado este día → slot vacío
    IF v_dept_hours IS NULL OR jsonb_array_length(v_dept_hours) = 0 THEN
      v_result := v_result || jsonb_build_object(v_day::TEXT, '[]'::JSONB);
      CONTINUE;
    END IF;

    -- -------------------------------------------------------------------------
    -- 7. Resolver horario efectivo del USUARIO (si se informó)
    -- -------------------------------------------------------------------------
    IF p_user_id IS NOT NULL THEN
      SELECT
        ce.is_closed,
        ce.custom_hours
      INTO v_user_ex_closed, v_user_ex_hours
      FROM calendar_exceptions ce
      WHERE ce.target_type = 'USER'
        AND ce.target_id = p_user_id
        AND ce.exception_date = v_day;

      IF FOUND THEN
        IF v_user_ex_closed THEN
          v_result := v_result || jsonb_build_object(v_day::TEXT, '[]'::JSONB);
          CONTINUE;
        ELSIF v_user_ex_hours IS NOT NULL THEN
          v_user_hours := v_user_ex_hours;
        ELSE
          v_user_hours := COALESCE(v_user_schedule->(v_isodow::TEXT), '[]'::JSONB);
        END IF;
      ELSE
        v_user_hours := COALESCE(v_user_schedule->(v_isodow::TEXT), '[]'::JSONB);
      END IF;

      -- Usuario no disponible este día → slot vacío
      IF v_user_hours IS NULL OR jsonb_array_length(v_user_hours) = 0 THEN
        v_result := v_result || jsonb_build_object(v_day::TEXT, '[]'::JSONB);
        CONTINUE;
      END IF;
    END IF;

    -- -------------------------------------------------------------------------
    -- 8. Generar slots del día iterando sobre los periodos del DEPARTAMENTO
    --    e intersectando con Org y User
    -- -------------------------------------------------------------------------
    FOR v_period_elem IN
      SELECT jsonb_array_elements(v_dept_hours)
    LOOP
      -- Calcular inicio y fin del periodo en la timezone del departamento
      v_period_start := (v_day::TEXT || ' ' || (v_period_elem->>'start') || ':00')::TIMESTAMP
                        AT TIME ZONE v_dept_timezone;
      v_period_end   := (v_day::TEXT || ' ' || (v_period_elem->>'end')   || ':00')::TIMESTAMP
                        AT TIME ZONE v_dept_timezone;

      -- Generar cada slot dentro del periodo
      v_slot_start := v_period_start;
      WHILE v_slot_start + (v_slot_duration * INTERVAL '1 minute') <= v_period_end LOOP
        v_slot_end   := v_slot_start + (v_slot_duration * INTERVAL '1 minute');
        v_is_blocked := FALSE;

        -- 8a. ¿El slot cae dentro del horario de la Org?
        SELECT NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(v_org_hours) AS org_elem
          WHERE
            (v_day::TEXT || ' ' || (org_elem->>'start') || ':00')::TIMESTAMP AT TIME ZONE v_dept_timezone <= v_slot_start
            AND
            (v_day::TEXT || ' ' || (org_elem->>'end')   || ':00')::TIMESTAMP AT TIME ZONE v_dept_timezone >= v_slot_end
        ) INTO v_is_blocked;

        -- 8b. ¿El slot cae dentro del horario del Usuario (si aplica)?
        IF NOT v_is_blocked AND p_user_id IS NOT NULL THEN
          SELECT NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements(v_user_hours) AS usr_elem
            WHERE
              (v_day::TEXT || ' ' || (usr_elem->>'start') || ':00')::TIMESTAMP AT TIME ZONE v_dept_timezone <= v_slot_start
              AND
              (v_day::TEXT || ' ' || (usr_elem->>'end')   || ':00')::TIMESTAMP AT TIME ZONE v_dept_timezone >= v_slot_end
          ) INTO v_is_blocked;
        END IF;

        -- 8c. ¿El slot se solapa con una cita CONFIRMED existente?
        --     Se compara incluyendo buffers del departamento.
        IF NOT v_is_blocked THEN
          SELECT EXISTS (
            SELECT 1
            FROM appointments a
            WHERE a.department_id = p_department_id
              AND a.status = 'CONFIRMED'
              AND tstzrange(a.start_at, a.end_at, '[)') &&
                  tstzrange(
                    v_slot_start - (v_buffer_before * INTERVAL '1 minute'),
                    v_slot_end   + (v_buffer_after  * INTERVAL '1 minute'),
                    '[)'
                  )
          ) INTO v_is_blocked;
        END IF;

        -- Si el slot está libre → añadir en la timezone del cliente
        IF NOT v_is_blocked THEN
          v_time_str := TO_CHAR(v_slot_start AT TIME ZONE p_client_timezone, 'HH24:MI');
          v_slots    := v_slots || to_jsonb(v_time_str);
        END IF;

        v_slot_start := v_slot_start + (v_slot_duration * INTERVAL '1 minute');
      END LOOP;
    END LOOP;

    v_result := v_result || jsonb_build_object(v_day::TEXT, v_slots);
  END LOOP;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_time_window_availability(UUID, UUID, UUID, DATE, DATE, TEXT) IS
'Motor de disponibilidad: calcula los huecos libres en un rango de fechas
mediante la triple intersección de calendarios (Org ∩ Dept ∩ User),
aplicando excepciones y restando citas CONFIRMED. Máximo 30 días por llamada.';


-- ============================================================================
-- RPC 2: book_appointment
-- Confirma una reserva con protección transaccional anti-double-booking
-- ============================================================================
--
-- Lanza la reserva que propone el Agente de IA. El INSERT activa el
-- constraint GIST de exclusión: si dos clientes llegan al mismo hueco
-- a la vez, solo uno de los dos INSERT tiene éxito.
--
-- Devuelve JSONB con la cita creada o un error estructurado.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.book_appointment(
  p_organization_id  UUID,
  p_department_id    UUID,
  p_client_name      TEXT,
  p_client_phone     TEXT,
  p_start_at         TIMESTAMPTZ,
  p_user_id          UUID  DEFAULT NULL,    -- Operario preasignado (puede ser NULL)
  p_assignment_mode  TEXT  DEFAULT NULL     -- 'MANUAL', 'AI', 'AUTO'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_slot_duration   INTEGER;
  v_buffer_before   INTEGER;
  v_buffer_after    INTEGER;
  v_end_at          TIMESTAMPTZ;
  v_new_id          UUID;
  v_status          public.appointment_status;
  v_assign_mode     public.assignment_mode;
BEGIN

  -- 1. Validaciones de entrada
  IF p_client_name IS NULL OR trim(p_client_name) = '' THEN
    RETURN jsonb_build_object('error', 'client_name es obligatorio');
  END IF;

  IF p_client_phone IS NULL OR trim(p_client_phone) = '' THEN
    RETURN jsonb_build_object('error', 'client_phone es obligatorio');
  END IF;

  IF p_start_at < NOW() THEN
    RETURN jsonb_build_object('error', 'No se puede reservar en el pasado');
  END IF;

  -- 2. Leer configuración del departamento
  SELECT
    slot_duration_minutes,
    COALESCE(buffer_before_minutes, 0),
    COALESCE(buffer_after_minutes, 0)
  INTO v_slot_duration, v_buffer_before, v_buffer_after
  FROM departments
  WHERE id = p_department_id
    AND org_id = p_organization_id
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Departamento no encontrado o inactivo');
  END IF;

  -- 3. Calcular end_at: start + slot_duration + buffer_after
  -- El range guardado en DB incluye el buffer completo para que el GIST lo contemple
  v_end_at := p_start_at + (v_slot_duration * INTERVAL '1 minute')
                          + (v_buffer_after  * INTERVAL '1 minute');

  -- 4. Resolver el status y assignment_mode
  IF p_user_id IS NOT NULL THEN
    v_status := 'CONFIRMED';
    v_assign_mode := COALESCE(p_assignment_mode::public.assignment_mode, 'MANUAL');
  ELSE
    v_status := 'PENDING';   -- Pendiente de asignación de operario por admin
    v_assign_mode := NULL;
  END IF;

  -- 5. INSERT (el constraint GIST se valida aquí automáticamente)
  BEGIN
    INSERT INTO appointments (
      organization_id,
      department_id,
      user_id,
      assignment_mode,
      client_name,
      client_phone,
      start_at,
      end_at,
      status
    )
    VALUES (
      p_organization_id,
      p_department_id,
      p_user_id,
      v_assign_mode,
      trim(p_client_name),
      trim(p_client_phone),
      p_start_at - (v_buffer_before * INTERVAL '1 minute'),  -- start ajustado con buffer_before
      v_end_at,
      v_status
    )
    RETURNING id INTO v_new_id;

  EXCEPTION
    -- Error del constraint GIST: hueco ya ocupado (double-booking)
    WHEN exclusion_violation THEN
      RETURN jsonb_build_object(
        'error',       'double_booking',
        'message',     'El hueco seleccionado ya está ocupado. Por favor, elige otro.',
        'code',        'SLOT_TAKEN'
      );

    -- Cualquier otro error inesperado
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'error',       'unexpected_error',
        'message',     SQLERRM,
        'code',        SQLSTATE
      );
  END;

  -- 6. Devolver la cita creada
  RETURN jsonb_build_object(
    'id',              v_new_id,
    'organization_id', p_organization_id,
    'department_id',   p_department_id,
    'user_id',         p_user_id,
    'client_name',     trim(p_client_name),
    'client_phone',    trim(p_client_phone),
    'start_at',        (p_start_at - (v_buffer_before * INTERVAL '1 minute')),
    'end_at',          v_end_at,
    'status',          v_status::TEXT,
    'assignment_mode', v_assign_mode::TEXT
  );
END;
$$;

COMMENT ON FUNCTION public.book_appointment(UUID, UUID, TEXT, TEXT, TIMESTAMPTZ, UUID, TEXT) IS
'Crea una reserva en la tabla appointments con protección transaccional anti-double-booking
mediante el constraint GIST de exclusión. Si dos llamadas concurrentes intentan reservar
el mismo hueco, solo una tiene éxito; la otra recibe error estructurado SLOT_TAKEN.
Si p_user_id IS NULL → status PENDING (pendiente de asignación por el admin).
Si p_user_id IS NOT NULL → status CONFIRMED directamente.';


-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE fn_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fn_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('get_time_window_availability', 'book_appointment');

  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '✅ RPCs del Scheduling Engine';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'Funciones creadas: % / 2', fn_count;
  IF fn_count = 2 THEN
    RAISE NOTICE '✅ get_time_window_availability — OK';
    RAISE NOTICE '✅ book_appointment             — OK';
    RAISE NOTICE '';
    RAISE NOTICE 'Test rápido (ajusta los UUIDs a tu entorno):';
    RAISE NOTICE '  SELECT get_time_window_availability(';
    RAISE NOTICE '    ''<org-uuid>'',';
    RAISE NOTICE '    ''<dept-uuid>'',';
    RAISE NOTICE '    NULL,';
    RAISE NOTICE '    CURRENT_DATE,';
    RAISE NOTICE '    CURRENT_DATE + 7,';
    RAISE NOTICE '    ''Europe/Madrid''';
    RAISE NOTICE '  );';
  ELSE
    RAISE NOTICE '⚠️  Alguna función no se creó correctamente';
  END IF;
  RAISE NOTICE '═══════════════════════════════════════════════════';
END $$;
