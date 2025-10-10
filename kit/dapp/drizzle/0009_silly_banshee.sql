-- Add sidebar color columns to branding table
ALTER TABLE "branding" ADD COLUMN "color_sidebar" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_foreground" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_primary" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_primary_foreground" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_accent" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_accent_foreground" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_border" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_ring" text;

