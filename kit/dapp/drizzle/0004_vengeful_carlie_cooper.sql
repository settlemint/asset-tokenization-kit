CREATE INDEX "kyc_first_name_idx" ON "kyc_profiles" USING btree ("first_name");--> statement-breakpoint
CREATE INDEX "kyc_last_name_idx" ON "kyc_profiles" USING btree ("last_name");