ALTER TABLE "call_flow_templates" ALTER COLUMN "sector" SET DEFAULT 'concesionario';--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "sector" SET DEFAULT 'concesionario';--> statement-breakpoint
ALTER TABLE "voice_agents" ALTER COLUMN "sector" SET DEFAULT 'concesionario';