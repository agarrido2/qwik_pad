CREATE TYPE "public"."assistant_gender" AS ENUM('male', 'female');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "business_description" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "assistant_name" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "assistant_gender" "assistant_gender";--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "assistant_kindness_level" integer;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "assistant_friendliness_level" integer;