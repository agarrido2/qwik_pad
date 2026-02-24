UPDATE "organizations"
SET "sector" = 'concesionario'
WHERE "sector" IS NOT NULL AND "sector" <> 'concesionario';--> statement-breakpoint
UPDATE "voice_agents"
SET "sector" = 'concesionario'
WHERE "sector" IS NOT NULL AND "sector" <> 'concesionario';--> statement-breakpoint
UPDATE "call_flow_templates"
SET "sector" = 'concesionario'
WHERE "sector" IS NOT NULL AND "sector" <> 'concesionario';--> statement-breakpoint
ALTER TABLE "call_flow_templates" ADD CONSTRAINT "call_flow_templates_sector_concesionario_chk" CHECK ("call_flow_templates"."sector" IS NULL OR "call_flow_templates"."sector" = 'concesionario');--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_sector_concesionario_chk" CHECK ("organizations"."sector" IS NULL OR "organizations"."sector" = 'concesionario');--> statement-breakpoint
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_sector_concesionario_chk" CHECK ("voice_agents"."sector" IS NULL OR "voice_agents"."sector" = 'concesionario');