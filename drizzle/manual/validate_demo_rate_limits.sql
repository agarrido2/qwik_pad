/**
 * PostgreSQL Function: Validación de Rate Limits ANTES de Insert
 * @description Trigger que valida límites de uso antes de insertar en users_demo
 * 
 * REGLAS DE NEGOCIO:
 * - Máximo 200 demos por teléfono en 1 mes
 * - Máximo 200 intentos por IP en 1 mes
 * - Auto-bloqueo de IP si excede límite
 * 
 * NOTA: Ajustar MAX_CALLS a 2 en producción
 */

-- ═══════════════════════════════════════════════════════════════════
-- 🔧 FUNCTION: Validar Rate Limits
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_demo_rate_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_phone_count INTEGER;
  v_ip_record RECORD;
  v_max_calls INTEGER := 200; -- TODO: Cambiar a 2 en producción
  v_max_ip_trials INTEGER := 200;
  v_one_month_ago TIMESTAMP;
BEGIN
  v_one_month_ago := NOW() - INTERVAL '1 month';

  -- ───────────────────────────────────────────────────────────────
  -- 1️⃣ VALIDAR RATE LIMIT POR TELÉFONO
  -- ───────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_phone_count
  FROM users_demo
  WHERE phone = NEW.phone
    AND created_at > v_one_month_ago;

  IF v_phone_count >= v_max_calls THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Phone % has exceeded % calls per month', 
      NEW.phone, v_max_calls;
  END IF;

  -- ───────────────────────────────────────────────────────────────
  -- 2️⃣ VALIDAR RATE LIMIT POR IP
  -- ───────────────────────────────────────────────────────────────
  SELECT * INTO v_ip_record
  FROM ip_trials
  WHERE ip_address = NEW.ip_address;

  -- Si la IP está explícitamente bloqueada
  IF v_ip_record.blocked_at IS NOT NULL THEN
    RAISE EXCEPTION 'IP_BLOCKED: IP % is blocked. Reason: %', 
      NEW.ip_address, v_ip_record.blocked_reason;
  END IF;

  -- Si existe registro de IP, validar contador
  IF FOUND THEN
    -- Reset automático si el último trial fue hace más de 1 mes
    IF v_ip_record.last_trial_at < v_one_month_ago THEN
      UPDATE ip_trials
      SET trial_count = 1,
          last_trial_at = NOW()
      WHERE ip_address = NEW.ip_address;
    ELSE
      -- Verificar si excedió el límite
      IF v_ip_record.trial_count >= v_max_ip_trials THEN
        -- Auto-bloquear IP
        UPDATE ip_trials
        SET blocked_at = NOW(),
            blocked_reason = 'Exceeded ' || v_max_ip_trials || ' trials per month'
        WHERE ip_address = NEW.ip_address;
        
        RAISE EXCEPTION 'IP_BLOCKED: IP % exceeded limit of % trials', 
          NEW.ip_address, v_max_ip_trials;
      END IF;

      -- Incrementar contador
      UPDATE ip_trials
      SET trial_count = trial_count + 1,
          last_trial_at = NOW()
      WHERE ip_address = NEW.ip_address;
    END IF;
  ELSE
    -- IP nueva: crear registro inicial
    INSERT INTO ip_trials (ip_address, trial_count, last_trial_at)
    VALUES (NEW.ip_address, 1, NOW());
  END IF;

  -- ───────────────────────────────────────────────────────────────
  -- ✅ TODAS LAS VALIDACIONES PASARON
  -- ───────────────────────────────────────────────────────────────
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- ⚡ TRIGGER: Ejecutar validación BEFORE INSERT
-- ═══════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS validate_demo_before_insert ON users_demo;

CREATE TRIGGER validate_demo_before_insert
  BEFORE INSERT ON users_demo
  FOR EACH ROW
  EXECUTE FUNCTION validate_demo_rate_limits();

-- ═══════════════════════════════════════════════════════════════════
-- 📝 COMENTARIOS Y METADATA
-- ═══════════════════════════════════════════════════════════════════

COMMENT ON FUNCTION validate_demo_rate_limits() IS 
'Valida límites de uso (teléfono + IP) antes de insertar en users_demo. Lanza excepciones RATE_LIMIT_EXCEEDED o IP_BLOCKED.';

COMMENT ON TRIGGER validate_demo_before_insert ON users_demo IS
'Ejecuta validación de rate limits antes de cada INSERT en users_demo';
