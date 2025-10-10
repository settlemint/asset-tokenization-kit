-- Migration: Separate Light and Dark Mode Branding
-- This migration adds separate columns for light and dark mode assets and colors
-- It also migrates existing data to the new schema

-- ========== Add Light Mode Asset Columns ==========
ALTER TABLE "branding" ADD COLUMN "logo_main_light" text;
ALTER TABLE "branding" ADD COLUMN "logo_sidebar_light" text;
ALTER TABLE "branding" ADD COLUMN "logo_favicon_light" text;

-- ========== Add Dark Mode Asset Columns ==========
ALTER TABLE "branding" ADD COLUMN "logo_main_dark" text;
ALTER TABLE "branding" ADD COLUMN "logo_sidebar_dark" text;
ALTER TABLE "branding" ADD COLUMN "logo_favicon_dark" text;

-- ========== Add Light Mode Color Columns ==========
ALTER TABLE "branding" ADD COLUMN "color_primary_light" text;
ALTER TABLE "branding" ADD COLUMN "color_primary_hover_light" text;
ALTER TABLE "branding" ADD COLUMN "color_secondary_light" text;
ALTER TABLE "branding" ADD COLUMN "color_accent_light" text;
ALTER TABLE "branding" ADD COLUMN "color_background_darkest_light" text;
ALTER TABLE "branding" ADD COLUMN "color_background_lightest_light" text;
ALTER TABLE "branding" ADD COLUMN "color_background_gradient_start_light" text;
ALTER TABLE "branding" ADD COLUMN "color_background_gradient_end_light" text;
ALTER TABLE "branding" ADD COLUMN "color_state_success_light" text;
ALTER TABLE "branding" ADD COLUMN "color_state_success_background_light" text;
ALTER TABLE "branding" ADD COLUMN "color_state_warning_light" text;
ALTER TABLE "branding" ADD COLUMN "color_state_warning_background_light" text;
ALTER TABLE "branding" ADD COLUMN "color_state_error_light" text;
ALTER TABLE "branding" ADD COLUMN "color_state_error_background_light" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_primary_light" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_secondary_light" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_tertiary_light" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_quaternary_light" text;
ALTER TABLE "branding" ADD COLUMN "color_text_light" text;
ALTER TABLE "branding" ADD COLUMN "color_text_contrast_light" text;
ALTER TABLE "branding" ADD COLUMN "color_border_light" text;
ALTER TABLE "branding" ADD COLUMN "color_muted_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_foreground_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_primary_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_primary_foreground_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_accent_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_accent_foreground_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_border_light" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_ring_light" text;

-- ========== Add Dark Mode Color Columns ==========
ALTER TABLE "branding" ADD COLUMN "color_primary_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_primary_hover_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_secondary_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_accent_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_background_darkest_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_background_lightest_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_background_gradient_start_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_background_gradient_end_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_state_success_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_state_success_background_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_state_warning_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_state_warning_background_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_state_error_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_state_error_background_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_primary_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_secondary_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_tertiary_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_graphics_quaternary_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_text_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_text_contrast_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_border_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_muted_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_foreground_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_primary_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_primary_foreground_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_accent_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_accent_foreground_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_border_dark" text;
ALTER TABLE "branding" ADD COLUMN "color_sidebar_ring_dark" text;

-- ========== Migrate Existing Data ==========
-- Copy existing logo data to both light and dark mode (users can change later)
UPDATE "branding" 
SET 
  "logo_main_light" = "logo_main",
  "logo_main_dark" = "logo_main",
  "logo_sidebar_light" = "logo_sidebar",
  "logo_sidebar_dark" = "logo_sidebar",
  "logo_favicon_light" = "logo_favicon",
  "logo_favicon_dark" = "logo_favicon"
WHERE "logo_main" IS NOT NULL OR "logo_sidebar" IS NOT NULL OR "logo_favicon" IS NOT NULL;

-- Copy existing color data to both light and dark mode
UPDATE "branding" 
SET 
  "color_primary_light" = "color_primary",
  "color_primary_dark" = "color_primary",
  "color_primary_hover_light" = "color_primary_hover",
  "color_primary_hover_dark" = "color_primary_hover",
  "color_secondary_light" = "color_secondary",
  "color_secondary_dark" = "color_secondary",
  "color_accent_light" = "color_accent",
  "color_accent_dark" = "color_accent",
  "color_background_darkest_light" = "color_background_darkest",
  "color_background_darkest_dark" = "color_background_darkest",
  "color_background_lightest_light" = "color_background_lightest",
  "color_background_lightest_dark" = "color_background_lightest",
  "color_background_gradient_start_light" = "color_background_gradient_start",
  "color_background_gradient_start_dark" = "color_background_gradient_start",
  "color_background_gradient_end_light" = "color_background_gradient_end",
  "color_background_gradient_end_dark" = "color_background_gradient_end",
  "color_state_success_light" = "color_state_success",
  "color_state_success_dark" = "color_state_success",
  "color_state_success_background_light" = "color_state_success_background",
  "color_state_success_background_dark" = "color_state_success_background",
  "color_state_warning_light" = "color_state_warning",
  "color_state_warning_dark" = "color_state_warning",
  "color_state_warning_background_light" = "color_state_warning_background",
  "color_state_warning_background_dark" = "color_state_warning_background",
  "color_state_error_light" = "color_state_error",
  "color_state_error_dark" = "color_state_error",
  "color_state_error_background_light" = "color_state_error_background",
  "color_state_error_background_dark" = "color_state_error_background",
  "color_graphics_primary_light" = "color_graphics_primary",
  "color_graphics_primary_dark" = "color_graphics_primary",
  "color_graphics_secondary_light" = "color_graphics_secondary",
  "color_graphics_secondary_dark" = "color_graphics_secondary",
  "color_graphics_tertiary_light" = "color_graphics_tertiary",
  "color_graphics_tertiary_dark" = "color_graphics_tertiary",
  "color_graphics_quaternary_light" = "color_graphics_quaternary",
  "color_graphics_quaternary_dark" = "color_graphics_quaternary",
  "color_text_light" = "color_text",
  "color_text_dark" = "color_text",
  "color_text_contrast_light" = "color_text_contrast",
  "color_text_contrast_dark" = "color_text_contrast",
  "color_border_light" = "color_border",
  "color_border_dark" = "color_border",
  "color_muted_light" = "color_muted",
  "color_muted_dark" = "color_muted",
  "color_sidebar_light" = "color_sidebar",
  "color_sidebar_dark" = "color_sidebar",
  "color_sidebar_foreground_light" = "color_sidebar_foreground",
  "color_sidebar_foreground_dark" = "color_sidebar_foreground",
  "color_sidebar_primary_light" = "color_sidebar_primary",
  "color_sidebar_primary_dark" = "color_sidebar_primary",
  "color_sidebar_primary_foreground_light" = "color_sidebar_primary_foreground",
  "color_sidebar_primary_foreground_dark" = "color_sidebar_primary_foreground",
  "color_sidebar_accent_light" = "color_sidebar_accent",
  "color_sidebar_accent_dark" = "color_sidebar_accent",
  "color_sidebar_accent_foreground_light" = "color_sidebar_accent_foreground",
  "color_sidebar_accent_foreground_dark" = "color_sidebar_accent_foreground",
  "color_sidebar_border_light" = "color_sidebar_border",
  "color_sidebar_border_dark" = "color_sidebar_border",
  "color_sidebar_ring_light" = "color_sidebar_ring",
  "color_sidebar_ring_dark" = "color_sidebar_ring";

-- ========== Drop Old Columns ==========
ALTER TABLE "branding" DROP COLUMN IF EXISTS "logo_main";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "logo_sidebar";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "logo_favicon";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_primary";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_primary_hover";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_secondary";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_accent";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_background_darkest";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_background_lightest";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_background_gradient_start";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_background_gradient_end";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_state_success";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_state_success_background";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_state_warning";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_state_warning_background";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_state_error";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_state_error_background";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_graphics_primary";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_graphics_secondary";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_graphics_tertiary";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_graphics_quaternary";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_text";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_text_contrast";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_border";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_muted";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar_foreground";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar_primary";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar_primary_foreground";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar_accent";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar_accent_foreground";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar_border";
ALTER TABLE "branding" DROP COLUMN IF EXISTS "color_sidebar_ring";

