ALTER TYPE "public"."residency_status" ADD VALUE 'dual_resident';--> statement-breakpoint
ALTER TYPE "public"."residency_status" ADD VALUE 'unknown';--> statement-breakpoint
ALTER TABLE "kyc_profiles" RENAME COLUMN "nationality" TO "country";--> statement-breakpoint
DROP INDEX "kyc_nationality_idx";--> statement-breakpoint
CREATE INDEX "kyc_country_idx" ON "kyc_profiles" USING btree ("country");