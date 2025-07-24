ALTER TABLE "user" DROP CONSTRAINT "user_wallet_unique";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "secret_codes_confirmed" boolean DEFAULT false NOT NULL;