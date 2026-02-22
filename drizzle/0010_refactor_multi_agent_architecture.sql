-- ==========================================
-- MIGRACIÓN 0010: Refactor Arquitectura Multi-Agente
-- ==========================================
-- Fecha: 2026-02-21
-- Descripción: Transición de modelo 1:1 (agent_profiles) a modelo N:1 (voice_agents)
--              permitiendo múltiples agentes por organización con números dedicados.
--
-- Cambios principales:
-- 1. DROP agent_profiles (tabla vacía, limitación 1:1 con users)
-- 2. CREATE voice_agents (N:1 con organizations)
-- 3. RENAME assigned_numbers → phone_numbers
-- 4. ALTER phone_numbers (añadir assigned_to_agent_id, provider_id)
-- 5. ALTER organizations (eliminar campos de assistant, ahora en voice_agents)
-- 6. CREATE enum phone_number_status

-- ==========================================
-- 1. CREAR ENUM para status de números
-- ==========================================

DO $$ BEGIN
 CREATE TYPE "public"."phone_number_status" AS ENUM('available', 'assigned', 'suspended');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. ELIMINAR tabla agent_profiles (VACÍA)
-- ==========================================
-- Justificación: Limitación 1:1 con users. Nueva arquitectura: N agentes por organization.

DROP TABLE IF EXISTS "public"."agent_profiles" CASCADE;

-- ==========================================
-- 3. CREAR tabla voice_agents
-- ==========================================

CREATE TABLE IF NOT EXISTS "public"."voice_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sector" text,
	"retell_agent_id" text,
	"phone_number_id" uuid,
	"assistant_name" text DEFAULT 'Asistente' NOT NULL,
	"assistant_gender" "assistant_gender" DEFAULT 'female' NOT NULL,
	"friendliness_level" integer DEFAULT 3 NOT NULL,
	"warmth_level" integer DEFAULT 3 NOT NULL,
	"business_description" text,
	"prompt_system" text,
	"transfer_policy" text,
	"leads_email" text,
	"webhook_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voice_agents_retell_agent_id_unique" UNIQUE("retell_agent_id"),
	CONSTRAINT "voice_agents_phone_number_id_unique" UNIQUE("phone_number_id")
);

-- ==========================================
-- 4. RENOMBRAR assigned_numbers → phone_numbers
-- ==========================================

ALTER TABLE "public"."assigned_numbers" RENAME TO "phone_numbers";

-- ==========================================
-- 5. MODIFICAR phone_numbers (añadir/eliminar columnas)
-- ==========================================

-- Añadir nuevas columnas
ALTER TABLE "public"."phone_numbers" ADD COLUMN IF NOT EXISTS "provider" text DEFAULT 'zadarma' NOT NULL;
ALTER TABLE "public"."phone_numbers" ADD COLUMN IF NOT EXISTS "provider_id" text;
ALTER TABLE "public"."phone_numbers" ADD COLUMN IF NOT EXISTS "assigned_to_agent_id" uuid;
ALTER TABLE "public"."phone_numbers" ADD CONSTRAINT "phone_numbers_assigned_to_agent_id_unique" UNIQUE("assigned_to_agent_id");

-- Eliminar columnas obsoletas
ALTER TABLE "public"."phone_numbers" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "public"."phone_numbers" DROP COLUMN IF EXISTS "zadarma_id";

-- Cambiar tipo de status de text a enum (requiere eliminar default, cambiar tipo, re-añadir default)
ALTER TABLE "public"."phone_numbers" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."phone_numbers" ALTER COLUMN "status" TYPE "phone_number_status" USING "status"::"phone_number_status";
ALTER TABLE "public"."phone_numbers" ALTER COLUMN "status" SET DEFAULT 'available';

-- ==========================================
-- 6. SIMPLIFICAR organizations (eliminar campos de assistant)
-- ==========================================

ALTER TABLE "public"."organizations" DROP COLUMN IF EXISTS "zadarme_phone_number";
ALTER TABLE "public"."organizations" DROP COLUMN IF EXISTS "retell_agent_id";
ALTER TABLE "public"."organizations" DROP COLUMN IF EXISTS "assistant_name";
ALTER TABLE "public"."organizations" DROP COLUMN IF EXISTS "assistant_gender";
ALTER TABLE "public"."organizations" DROP COLUMN IF EXISTS "assistant_kindness_level";
ALTER TABLE "public"."organizations" DROP COLUMN IF EXISTS "assistant_friendliness_level";

-- ==========================================
-- 7. FOREIGN KEYS - voice_agents
-- ==========================================

DO $$ BEGIN
 ALTER TABLE "public"."voice_agents" ADD CONSTRAINT "voice_agents_organization_id_organizations_id_fk" 
 FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "public"."voice_agents" ADD CONSTRAINT "voice_agents_created_by_users_id_fk" 
 FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- NOTA: phone_number_id es FK pero aún no creamos la constraint porque voice_agents ↔ phone_numbers
-- tienen referencia circular. La constraint se añadirá después de que phone_numbers tenga su FK.

-- ==========================================
-- 8. FOREIGN KEYS - phone_numbers
-- ==========================================

DO $$ BEGIN
 ALTER TABLE "public"."phone_numbers" ADD CONSTRAINT "phone_numbers_assigned_to_agent_id_voice_agents_id_fk" 
 FOREIGN KEY ("assigned_to_agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Ahora sí, añadimos la FK de voice_agents.phone_number_id → phone_numbers.id
DO $$ BEGIN
 ALTER TABLE "public"."voice_agents" ADD CONSTRAINT "voice_agents_phone_number_id_phone_numbers_id_fk" 
 FOREIGN KEY ("phone_number_id") REFERENCES "public"."phone_numbers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 9. ÍNDICES - voice_agents
-- ==========================================

CREATE INDEX IF NOT EXISTS "idx_voice_agents_org" ON "public"."voice_agents" USING btree ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_voice_agents_org_active" ON "public"."voice_agents" USING btree ("organization_id","is_active");
CREATE INDEX IF NOT EXISTS "idx_voice_agents_retell" ON "public"."voice_agents" USING btree ("retell_agent_id");
CREATE INDEX IF NOT EXISTS "idx_voice_agents_sector" ON "public"."voice_agents" USING btree ("sector");

-- ==========================================
-- 10. ÍNDICES - phone_numbers (actualizar)
-- ==========================================

-- Eliminar índices antiguos (renombrados automáticamente por Postgres al RENAME TABLE)
DROP INDEX IF EXISTS "idx_assigned_numbers_user_id";
DROP INDEX IF EXISTS "idx_assigned_numbers_status";

-- Crear nuevos índices
CREATE INDEX IF NOT EXISTS "idx_phone_numbers_org" ON "public"."phone_numbers" USING btree ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_phone_numbers_agent" ON "public"."phone_numbers" USING btree ("assigned_to_agent_id");
CREATE INDEX IF NOT EXISTS "idx_phone_numbers_status" ON "public"."phone_numbers" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_phone_numbers_org_status" ON "public"."phone_numbers" USING btree ("organization_id","status");

-- ==========================================
-- 11. COMENTARIOS (Documentación)
-- ==========================================

COMMENT ON TABLE "public"."voice_agents" IS 
'Agentes de voz con IA configurables por organización. Arquitectura Multi-Agente: 1 organización → N agentes.';

COMMENT ON COLUMN "public"."voice_agents"."phone_number_id" IS 
'FK a phone_numbers (1:1). Un agente tiene un único número asignado.';

COMMENT ON COLUMN "public"."voice_agents"."created_by" IS 
'Usuario que creó el agente (auditoría).';

COMMENT ON TABLE "public"."phone_numbers" IS 
'Pool de números virtuales (Zadarma/Twilio). 1 número → 1 agente (voice_agents.phone_number_id).';

COMMENT ON COLUMN "public"."phone_numbers"."assigned_to_agent_id" IS 
'FK inversa desde voice_agents. Un número solo puede estar asignado a un agente.';
