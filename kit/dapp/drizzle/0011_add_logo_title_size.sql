-- Add logo and title size fields to branding table
ALTER TABLE "branding" ADD COLUMN "logo_size" text DEFAULT '1.0';
ALTER TABLE "branding" ADD COLUMN "title_size" text DEFAULT '1.0';

-- Update existing records with default values
UPDATE "branding" SET "logo_size" = '1.0' WHERE "logo_size" IS NULL;
UPDATE "branding" SET "title_size" = '1.0' WHERE "title_size" IS NULL;
