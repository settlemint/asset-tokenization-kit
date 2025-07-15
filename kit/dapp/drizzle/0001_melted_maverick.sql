CREATE TYPE "public"."residency_status" AS ENUM('resident', 'non_resident');--> statement-breakpoint
CREATE TABLE "kyc_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"dob" date NOT NULL,
	"nationality" text NOT NULL,
	"residency_status" "residency_status" NOT NULL,
	"national_id_encrypted" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "kyc_email_idx" ON "kyc_profiles" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "kyc_nationality_idx" ON "kyc_profiles" USING btree ("nationality");