ALTER TABLE "industry_types" RENAME TO "sectors";
--> statement-breakpoint
ALTER TABLE "call_flow_templates" RENAME COLUMN "industry_type_id" TO "sector_id";
--> statement-breakpoint
ALTER TABLE "organizations" RENAME COLUMN "industry" TO "sector";
--> statement-breakpoint
ALTER TABLE "agent_profiles" RENAME COLUMN "industry" TO "sector";
--> statement-breakpoint
ALTER TABLE "users_demo" RENAME COLUMN "industry" TO "sector";
--> statement-breakpoint

ALTER TABLE "agent_profiles" ALTER COLUMN "sector" TYPE text USING "sector"::text;
--> statement-breakpoint
ALTER TABLE "users_demo" ALTER COLUMN "sector" TYPE text USING "sector"::text;
--> statement-breakpoint

ALTER TABLE "sectors" RENAME CONSTRAINT "industry_types_slug_unique" TO "sectors_slug_unique";
--> statement-breakpoint
ALTER TABLE "call_flow_templates" RENAME CONSTRAINT "call_flow_templates_industry_type_id_industry_types_id_fk" TO "call_flow_templates_sector_id_sectors_id_fk";
--> statement-breakpoint
ALTER INDEX "idx_agent_profiles_industry" RENAME TO "idx_agent_profiles_sector";
--> statement-breakpoint

DROP TYPE "public"."industry_sector";