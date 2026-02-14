CREATE TABLE "pending_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"invited_by" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pending_invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "pending_invitations_email_organization_id_unique" UNIQUE("email","organization_id")
);
--> statement-breakpoint
ALTER TABLE "pending_invitations" ADD CONSTRAINT "pending_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_invitations" ADD CONSTRAINT "pending_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pending_invitations_email" ON "pending_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_pending_invitations_org" ON "pending_invitations" USING btree ("organization_id");