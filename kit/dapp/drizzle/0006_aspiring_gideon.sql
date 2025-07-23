ALTER TYPE "public"."residency_status" ADD VALUE 'dual_resident';--> statement-breakpoint
ALTER TYPE "public"."residency_status" ADD VALUE 'unknown';--> statement-breakpoint
DROP INDEX "kyc_nationality_idx";--> statement-breakpoint
ALTER TABLE "kyc_profiles" DROP COLUMN "nationality";