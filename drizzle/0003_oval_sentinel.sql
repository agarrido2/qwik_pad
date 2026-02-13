CREATE TYPE "public"."industry_sector" AS ENUM('concesionario', 'inmobiliaria', 'retail', 'alquiladora', 'sat');--> statement-breakpoint
CREATE TABLE "agent_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid,
	"business_name" text NOT NULL,
	"notification_email" text NOT NULL,
	"website" text,
	"handoff_phone" text NOT NULL,
	"industry" "industry_sector" NOT NULL,
	"agent_phone" text NOT NULL,
	"business_description" text NOT NULL,
	"leads_email" text NOT NULL,
	"transfer_policy" text,
	"assistant_gender" "assistant_gender" DEFAULT 'female' NOT NULL,
	"assistant_name" text DEFAULT 'Asistente' NOT NULL,
	"friendliness_level" integer DEFAULT 3 NOT NULL,
	"warmth_level" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assigned_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" text NOT NULL,
	"phone_number_formatted" text NOT NULL,
	"prefix" text DEFAULT '+34' NOT NULL,
	"location" text NOT NULL,
	"user_id" uuid,
	"organization_id" uuid,
	"assigned_at" timestamp with time zone,
	"status" text DEFAULT 'available' NOT NULL,
	"zadarma_id" text,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assigned_numbers_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "ip_trials" (
	"ip_address" text PRIMARY KEY NOT NULL,
	"trial_count" integer DEFAULT 0 NOT NULL,
	"blocked_at" timestamp with time zone,
	"blocked_reason" text,
	"last_trial_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_demo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"industry" "industry_sector" NOT NULL,
	"ip_address" text NOT NULL,
	"retell_call_id" text,
	"duration_call" integer DEFAULT 0,
	"status" text DEFAULT 'pending_verification' NOT NULL,
	"verified_at" timestamp with time zone,
	"verification_type" text DEFAULT 'email_otp',
	"satisfaction" integer DEFAULT 0 NOT NULL,
	"resource_origin" text,
	"utm_campaign" text,
	"utm_medium" text,
	"converted_org_id" uuid,
	"score_sentiment" text,
	"url_record" text,
	"retell_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_numbers" ADD CONSTRAINT "assigned_numbers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_numbers" ADD CONSTRAINT "assigned_numbers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_demo" ADD CONSTRAINT "users_demo_converted_org_id_organizations_id_fk" FOREIGN KEY ("converted_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agent_profiles_industry" ON "agent_profiles" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "idx_assigned_numbers_user_id" ON "assigned_numbers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_assigned_numbers_status" ON "assigned_numbers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ip_trials_blocked" ON "ip_trials" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_users_demo_status" ON "users_demo" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_demo_email_status" ON "users_demo" USING btree ("email","status");--> statement-breakpoint
CREATE INDEX "idx_users_demo_resource_origin" ON "users_demo" USING btree ("resource_origin");