import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Branding settings table schema for storing platform customization
 * Allows customization of:
 * - Application title
 * - Logo variants (main, sidebar, favicon)
 * - Background images (light/dark mode, onboarding)
 * - Color scheme (primary, secondary, accent, background colors)
 *
 * Images are stored in MinIO S3 storage with URLs in the database
 */
export const branding = pgTable("branding", {
  /** Unique identifier for the branding configuration */
  id: uuid("id").primaryKey().defaultRandom(),

  /** Application title displayed in browser tab and header */
  applicationTitle: text("application_title"),

  /** Main logo URL (used in header, typically horizontal) */
  logoMain: text("logo_main"),

  /** Sidebar logo URL (used in collapsed sidebar, typically icon) */
  logoSidebar: text("logo_sidebar"),

  /** Favicon URL (browser tab icon) */
  logoFavicon: text("logo_favicon"),

  /** Light mode background image URL (onboarding/auth pages) */
  backgroundLight: text("background_light"),

  /** Dark mode background image URL (onboarding/auth pages) */
  backgroundDark: text("background_dark"),

  /** Primary brand color (oklch format, e.g., "oklch(0.5745 0.2028 263.15)") */
  colorPrimary: text("color_primary"),

  /** Primary brand color hover state */
  colorPrimaryHover: text("color_primary_hover"),

  /** Secondary color */
  colorSecondary: text("color_secondary"),

  /** Accent color */
  colorAccent: text("color_accent"),

  /** Background darkest shade */
  colorBackgroundDarkest: text("color_background_darkest"),

  /** Background lightest shade */
  colorBackgroundLightest: text("color_background_lightest"),

  /** Background gradient start color */
  colorBackgroundGradientStart: text("color_background_gradient_start"),

  /** Background gradient end color */
  colorBackgroundGradientEnd: text("color_background_gradient_end"),

  /** Success state color */
  colorStateSuccess: text("color_state_success"),

  /** Success state background color */
  colorStateSuccessBackground: text("color_state_success_background"),

  /** Warning state color */
  colorStateWarning: text("color_state_warning"),

  /** Warning state background color */
  colorStateWarningBackground: text("color_state_warning_background"),

  /** Error state color */
  colorStateError: text("color_state_error"),

  /** Error state background color */
  colorStateErrorBackground: text("color_state_error_background"),

  /** Graphics primary color */
  colorGraphicsPrimary: text("color_graphics_primary"),

  /** Graphics secondary color */
  colorGraphicsSecondary: text("color_graphics_secondary"),

  /** Graphics tertiary color */
  colorGraphicsTertiary: text("color_graphics_tertiary"),

  /** Graphics quaternary color */
  colorGraphicsQuaternary: text("color_graphics_quaternary"),

  /** Text color */
  colorText: text("color_text"),

  /** Text contrast color (for use on dark backgrounds) */
  colorTextContrast: text("color_text_contrast"),

  /** Border color */
  colorBorder: text("color_border"),

  /** Muted color */
  colorMuted: text("color_muted"),

  /** Sidebar background color */
  colorSidebar: text("color_sidebar"),

  /** Sidebar foreground color */
  colorSidebarForeground: text("color_sidebar_foreground"),

  /** Sidebar primary color */
  colorSidebarPrimary: text("color_sidebar_primary"),

  /** Sidebar primary foreground color */
  colorSidebarPrimaryForeground: text("color_sidebar_primary_foreground"),

  /** Sidebar accent color */
  colorSidebarAccent: text("color_sidebar_accent"),

  /** Sidebar accent foreground color */
  colorSidebarAccentForeground: text("color_sidebar_accent_foreground"),

  /** Sidebar border color */
  colorSidebarBorder: text("color_sidebar_border"),

  /** Sidebar ring color */
  colorSidebarRing: text("color_sidebar_ring"),

  /** When the branding was created */
  createdAt: timestamp("created_at").notNull().defaultNow(),

  /** When the branding was last updated */
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Default branding values that match the current SettleMint theme.
 * These are the original theme values - DO NOT change these defaults.
 * Users can customize through the branding UI, but defaults should remain unchanged.
 */
export const DEFAULT_BRANDING = {
  applicationTitle: "Asset Tokenization Kit",
  // Leave all colors null by default - the app will use CSS variable defaults
  // This ensures the original theme is preserved
  colorPrimary: null,
  colorPrimaryHover: null,
  colorSecondary: null,
  colorAccent: null,
  colorBackgroundDarkest: null,
  colorBackgroundLightest: null,
  colorBackgroundGradientStart: null,
  colorBackgroundGradientEnd: null,
  colorStateSuccess: null,
  colorStateSuccessBackground: null,
  colorStateWarning: null,
  colorStateWarningBackground: null,
  colorStateError: null,
  colorStateErrorBackground: null,
  colorGraphicsPrimary: null,
  colorGraphicsSecondary: null,
  colorGraphicsTertiary: null,
  colorGraphicsQuaternary: null,
  colorText: null,
  colorTextContrast: null,
  colorBorder: null,
  colorMuted: null,
  colorSidebar: null,
  colorSidebarForeground: null,
  colorSidebarPrimary: null,
  colorSidebarPrimaryForeground: null,
  colorSidebarAccent: null,
  colorSidebarAccentForeground: null,
  colorSidebarBorder: null,
  colorSidebarRing: null,
} as const;
