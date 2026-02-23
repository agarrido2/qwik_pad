CREATE TYPE "public"."appointment_status" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."assignment_mode" AS ENUM('manual', 'ai');--> statement-breakpoint
CREATE TYPE "public"."calendar_target_type" AS ENUM('ORGANIZATION', 'DEPARTMENT', 'USER');--> statement-breakpoint
CREATE TYPE "public"."phone_number_status" AS ENUM('available', 'assigned', 'suspended');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"user_id" uuid,
	"assigned_by_user_id" uuid,
	"assignment_mode" "assignment_mode",
	"client_name" text NOT NULL,
	"client_phone" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'PENDING' NOT NULL,
	"cancellation_reason" text,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_role_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"changed_by_user_id" uuid,
	"old_role" "user_role",
	"new_role" "user_role" NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "calendar_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"exception_date" date NOT NULL,
	"is_closed" boolean DEFAULT true NOT NULL,
	"custom_hours" jsonb,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_exceptions_target_type_target_id_exception_date_unique" UNIQUE("target_type","target_id","exception_date")
);
--> statement-breakpoint
CREATE TABLE "calendar_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "calendar_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"timezone" text DEFAULT 'Europe/Madrid' NOT NULL,
	"weekly_hours" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_schedules_target_type_target_id_unique" UNIQUE("target_type","target_id")
);
--> statement-breakpoint
CREATE TABLE "department_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_lead" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "department_members_department_id_user_id_unique" UNIQUE("department_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "phone_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" text NOT NULL,
	"phone_number_formatted" text NOT NULL,
	"prefix" text DEFAULT '+34' NOT NULL,
	"location" text NOT NULL,
	"provider" text DEFAULT 'zadarma' NOT NULL,
	"provider_id" text,
	"organization_id" uuid,
	"assigned_to_agent_id" uuid,
	"status" "phone_number_status" DEFAULT 'available' NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "phone_numbers_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "phone_numbers_assigned_to_agent_id_unique" UNIQUE("assigned_to_agent_id")
);
--> statement-breakpoint
CREATE TABLE "voice_agents" (
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
--> statement-breakpoint
ALTER TABLE "agent_profiles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assigned_numbers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sectors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "agent_profiles" CASCADE;--> statement-breakpoint
DROP TABLE "assigned_numbers" CASCADE;--> statement-breakpoint
DROP TABLE "sectors" CASCADE;--> statement-breakpoint
ALTER TABLE "call_flow_templates" DROP CONSTRAINT "call_flow_templates_sector_id_sectors_id_fk";
--> statement-breakpoint
ALTER TABLE "call_flow_templates" ADD COLUMN "sector" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "slot_duration_minutes" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "buffer_before_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "buffer_after_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_role_changes" ADD CONSTRAINT "audit_role_changes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_role_changes" ADD CONSTRAINT "audit_role_changes_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_role_changes" ADD CONSTRAINT "audit_role_changes_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_members" ADD CONSTRAINT "department_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_assigned_to_agent_id_voice_agents_id_fk" FOREIGN KEY ("assigned_to_agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_appointments_org" ON "appointments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_dept_date" ON "appointments" USING btree ("department_id","start_at","end_at");--> statement-breakpoint
CREATE INDEX "idx_appointments_user_date" ON "appointments" USING btree ("user_id","start_at");--> statement-breakpoint
CREATE INDEX "idx_appointments_org_date" ON "appointments" USING btree ("organization_id","start_at");--> statement-breakpoint
CREATE INDEX "idx_appointments_pending" ON "appointments" USING btree ("department_id","status");--> statement-breakpoint
CREATE INDEX "idx_audit_role_changes_org" ON "audit_role_changes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_audit_role_changes_target_user" ON "audit_role_changes" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_role_changes_changed_at" ON "audit_role_changes" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "idx_audit_role_changes_org_user" ON "audit_role_changes" USING btree ("organization_id","target_user_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_exceptions_target_date" ON "calendar_exceptions" USING btree ("target_id","exception_date");--> statement-breakpoint
CREATE INDEX "idx_calendar_schedules_target" ON "calendar_schedules" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_dept_members_dept" ON "department_members" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "idx_dept_members_user" ON "department_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dept_members_dept_active" ON "department_members" USING btree ("department_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_phone_numbers_org" ON "phone_numbers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_phone_numbers_agent" ON "phone_numbers" USING btree ("assigned_to_agent_id");--> statement-breakpoint
CREATE INDEX "idx_phone_numbers_status" ON "phone_numbers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_phone_numbers_org_status" ON "phone_numbers" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_voice_agents_org" ON "voice_agents" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_voice_agents_org_active" ON "voice_agents" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_voice_agents_retell" ON "voice_agents" USING btree ("retell_agent_id");--> statement-breakpoint
CREATE INDEX "idx_voice_agents_sector" ON "voice_agents" USING btree ("sector");--> statement-breakpoint
ALTER TABLE "call_flow_templates" DROP COLUMN "sector_id";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "zadarme_phone_number";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "retell_agent_id";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "assistant_name";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "assistant_gender";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "assistant_kindness_level";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "assistant_friendliness_level";