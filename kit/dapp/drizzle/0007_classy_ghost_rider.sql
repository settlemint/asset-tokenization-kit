-- Rename column from national_id_encrypted to national_id
ALTER TABLE "kyc_profiles" RENAME COLUMN "national_id_encrypted" TO "national_id";