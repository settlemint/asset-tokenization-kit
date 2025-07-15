ALTER TABLE "kyc_profiles" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "kyc_profiles" ADD CONSTRAINT "kyc_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "kyc_user_id_idx" ON "kyc_profiles" USING btree ("user_id");