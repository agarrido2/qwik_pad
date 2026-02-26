CREATE TYPE "public"."voice_agent_status" AS ENUM('draft', 'published', 'paused');--> statement-breakpoint
CREATE TABLE "master_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sector" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'bot' NOT NULL,
	"system_prompt" text NOT NULL,
	"welcome_message_default" text,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "master_prompts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "voice_agents" DROP CONSTRAINT "voice_agents_sector_concesionario_chk";--> statement-breakpoint
ALTER TABLE "voice_agents" ADD COLUMN "master_prompt_id" uuid;--> statement-breakpoint
ALTER TABLE "voice_agents" ADD COLUMN "status" "voice_agent_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "voice_agents" ADD COLUMN "welcome_message" text;--> statement-breakpoint
CREATE INDEX "idx_master_prompts_sector" ON "master_prompts" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "idx_master_prompts_sector_active" ON "master_prompts" USING btree ("sector","is_active");--> statement-breakpoint
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_master_prompt_id_master_prompts_id_fk" FOREIGN KEY ("master_prompt_id") REFERENCES "public"."master_prompts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_voice_agents_master_prompt" ON "voice_agents" USING btree ("master_prompt_id");--> statement-breakpoint
CREATE INDEX "idx_voice_agents_status" ON "voice_agents" USING btree ("organization_id","status");