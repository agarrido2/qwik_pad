CREATE TYPE "public"."appointment_type" AS ENUM('appointment', 'callback', 'visit');--> statement-breakpoint
CREATE TYPE "public"."contact_source" AS ENUM('call', 'web', 'manual', 'import');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('prospect', 'lead', 'qualified', 'client', 'inactive');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"agent_id" uuid,
	"status" "contact_status" DEFAULT 'prospect' NOT NULL,
	"source" "contact_source" DEFAULT 'call' NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "start_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "end_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "type" "appointment_type" DEFAULT 'appointment' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "callback_preferred_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_agent_id_voice_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_contacts_org" ON "contacts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_contacts_org_status" ON "contacts" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_contacts_org_source" ON "contacts" USING btree ("organization_id","source");--> statement-breakpoint
CREATE INDEX "idx_contacts_agent" ON "contacts" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "idx_contacts_org_phone" ON "contacts" USING btree ("organization_id","phone");--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;