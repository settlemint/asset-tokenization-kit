import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Branding settings table schema for storing platform customization
 * Allows customization of:
 * - Application title
 * - Logo variants (light/dark mode for main, sidebar, favicon)
 * - Background images (light/dark mode for onboarding/auth pages)
 * - Color schemes (separate for light and dark modes)
 *
 * Images are stored in MinIO S3 storage with URLs in the database
 * All colors use oklch format for better color perception
 */
export const branding = pgTable("branding", {
  /** Unique identifier for the branding configuration */
  id: uuid("id").primaryKey().defaultRandom(),

  /** Application title displayed in browser tab and header */
  applicationTitle: text("application_title"),

  /** Logo size multiplier (default: 1.0, range: 0.5-2.0) */
  logoSize: text("logo_size"),

  /** Application title text size multiplier (default: 1.0, range: 0.5-2.0) */
  titleSize: text("title_size"),

  // ========== LIGHT MODE ASSETS ==========
  /** Main logo URL for light mode (used in header, typically horizontal) */
  logoMainLight: text("logo_main_light"),

  /** Sidebar logo URL for light mode (used in collapsed sidebar, typically icon) */
  logoSidebarLight: text("logo_sidebar_light"),

  /** Favicon URL for light mode (browser tab icon) */
  logoFaviconLight: text("logo_favicon_light"),

  /** Light mode background image URL (onboarding/auth pages) */
  backgroundLight: text("background_light"),

  // ========== DARK MODE ASSETS ==========
  /** Main logo URL for dark mode (used in header, typically horizontal) */
  logoMainDark: text("logo_main_dark"),

  /** Sidebar logo URL for dark mode (used in collapsed sidebar, typically icon) */
  logoSidebarDark: text("logo_sidebar_dark"),

  /** Favicon URL for dark mode (browser tab icon) */
  logoFaviconDark: text("logo_favicon_dark"),

  /** Dark mode background image URL (onboarding/auth pages) */
  backgroundDark: text("background_dark"),

  // ========== LIGHT MODE COLORS ==========
  /** Primary brand color for light mode - Used for primary buttons, links, and key UI elements */
  colorPrimaryLight: text("color_primary_light"),

  /** Primary hover state for light mode - Darker shade when hovering over primary elements */
  colorPrimaryHoverLight: text("color_primary_hover_light"),

  /** Secondary color for light mode - Used for secondary actions and supporting elements */
  colorSecondaryLight: text("color_secondary_light"),

  /** Accent color for light mode - Used for highlights and emphasis */
  colorAccentLight: text("color_accent_light"),

  /** Background darkest shade for light mode - Deepest background color */
  colorBackgroundDarkestLight: text("color_background_darkest_light"),

  /** Background lightest shade for light mode - Lightest background color */
  colorBackgroundLightestLight: text("color_background_lightest_light"),

  /** Background gradient start for light mode - Starting color for gradient backgrounds */
  colorBackgroundGradientStartLight: text(
    "color_background_gradient_start_light"
  ),

  /** Background gradient end for light mode - Ending color for gradient backgrounds */
  colorBackgroundGradientEndLight: text("color_background_gradient_end_light"),

  /** Success state color for light mode - Used for positive feedback and confirmations */
  colorStateSuccessLight: text("color_state_success_light"),

  /** Success background for light mode - Background color for success messages */
  colorStateSuccessBackgroundLight: text(
    "color_state_success_background_light"
  ),

  /** Warning state color for light mode - Used for caution messages */
  colorStateWarningLight: text("color_state_warning_light"),

  /** Warning background for light mode - Background color for warning messages */
  colorStateWarningBackgroundLight: text(
    "color_state_warning_background_light"
  ),

  /** Error state color for light mode - Used for error messages and validation */
  colorStateErrorLight: text("color_state_error_light"),

  /** Error background for light mode - Background color for error messages */
  colorStateErrorBackgroundLight: text("color_state_error_background_light"),

  /** Graphics primary color for light mode - Primary color for charts and graphs */
  colorGraphicsPrimaryLight: text("color_graphics_primary_light"),

  /** Graphics secondary color for light mode - Secondary color for charts and graphs */
  colorGraphicsSecondaryLight: text("color_graphics_secondary_light"),

  /** Graphics tertiary color for light mode - Third color option for data visualization */
  colorGraphicsTertiaryLight: text("color_graphics_tertiary_light"),

  /** Graphics quaternary color for light mode - Fourth color option for data visualization */
  colorGraphicsQuaternaryLight: text("color_graphics_quaternary_light"),

  /** Text color for light mode - Main text color used throughout the application */
  colorTextLight: text("color_text_light"),

  /** Text contrast color for light mode - Text color for use on colored backgrounds */
  colorTextContrastLight: text("color_text_contrast_light"),

  /** Border color for light mode - Used for borders, dividers, and outlines */
  colorBorderLight: text("color_border_light"),

  /** Muted color for light mode - Used for less important text and disabled states */
  colorMutedLight: text("color_muted_light"),

  /** Sidebar background for light mode - Background color of the navigation sidebar */
  colorSidebarLight: text("color_sidebar_light"),

  /** Sidebar text color for light mode - Text color in the sidebar */
  colorSidebarForegroundLight: text("color_sidebar_foreground_light"),

  /** Sidebar primary color for light mode - Highlighted items in sidebar */
  colorSidebarPrimaryLight: text("color_sidebar_primary_light"),

  /** Sidebar primary text for light mode - Text on highlighted sidebar items */
  colorSidebarPrimaryForegroundLight: text(
    "color_sidebar_primary_foreground_light"
  ),

  /** Sidebar accent color for light mode - Accent elements in sidebar */
  colorSidebarAccentLight: text("color_sidebar_accent_light"),

  /** Sidebar accent text for light mode - Text on accent sidebar elements */
  colorSidebarAccentForegroundLight: text(
    "color_sidebar_accent_foreground_light"
  ),

  /** Sidebar border for light mode - Border color in sidebar */
  colorSidebarBorderLight: text("color_sidebar_border_light"),

  /** Sidebar focus ring for light mode - Focus indicator color in sidebar */
  colorSidebarRingLight: text("color_sidebar_ring_light"),

  // ========== DARK MODE COLORS ==========
  /** Primary brand color for dark mode - Used for primary buttons, links, and key UI elements */
  colorPrimaryDark: text("color_primary_dark"),

  /** Primary hover state for dark mode - Lighter shade when hovering over primary elements */
  colorPrimaryHoverDark: text("color_primary_hover_dark"),

  /** Secondary color for dark mode - Used for secondary actions and supporting elements */
  colorSecondaryDark: text("color_secondary_dark"),

  /** Accent color for dark mode - Used for highlights and emphasis */
  colorAccentDark: text("color_accent_dark"),

  /** Background darkest shade for dark mode - Deepest background color */
  colorBackgroundDarkestDark: text("color_background_darkest_dark"),

  /** Background lightest shade for dark mode - Lightest background color */
  colorBackgroundLightestDark: text("color_background_lightest_dark"),

  /** Background gradient start for dark mode - Starting color for gradient backgrounds */
  colorBackgroundGradientStartDark: text(
    "color_background_gradient_start_dark"
  ),

  /** Background gradient end for dark mode - Ending color for gradient backgrounds */
  colorBackgroundGradientEndDark: text("color_background_gradient_end_dark"),

  /** Success state color for dark mode - Used for positive feedback and confirmations */
  colorStateSuccessDark: text("color_state_success_dark"),

  /** Success background for dark mode - Background color for success messages */
  colorStateSuccessBackgroundDark: text("color_state_success_background_dark"),

  /** Warning state color for dark mode - Used for caution messages */
  colorStateWarningDark: text("color_state_warning_dark"),

  /** Warning background for dark mode - Background color for warning messages */
  colorStateWarningBackgroundDark: text("color_state_warning_background_dark"),

  /** Error state color for dark mode - Used for error messages and validation */
  colorStateErrorDark: text("color_state_error_dark"),

  /** Error background for dark mode - Background color for error messages */
  colorStateErrorBackgroundDark: text("color_state_error_background_dark"),

  /** Graphics primary color for dark mode - Primary color for charts and graphs */
  colorGraphicsPrimaryDark: text("color_graphics_primary_dark"),

  /** Graphics secondary color for dark mode - Secondary color for charts and graphs */
  colorGraphicsSecondaryDark: text("color_graphics_secondary_dark"),

  /** Graphics tertiary color for dark mode - Third color option for data visualization */
  colorGraphicsTertiaryDark: text("color_graphics_tertiary_dark"),

  /** Graphics quaternary color for dark mode - Fourth color option for data visualization */
  colorGraphicsQuaternaryDark: text("color_graphics_quaternary_dark"),

  /** Text color for dark mode - Main text color used throughout the application */
  colorTextDark: text("color_text_dark"),

  /** Text contrast color for dark mode - Text color for use on colored backgrounds */
  colorTextContrastDark: text("color_text_contrast_dark"),

  /** Border color for dark mode - Used for borders, dividers, and outlines */
  colorBorderDark: text("color_border_dark"),

  /** Muted color for dark mode - Used for less important text and disabled states */
  colorMutedDark: text("color_muted_dark"),

  /** Sidebar background for dark mode - Background color of the navigation sidebar */
  colorSidebarDark: text("color_sidebar_dark"),

  /** Sidebar text color for dark mode - Text color in the sidebar */
  colorSidebarForegroundDark: text("color_sidebar_foreground_dark"),

  /** Sidebar primary color for dark mode - Highlighted items in sidebar */
  colorSidebarPrimaryDark: text("color_sidebar_primary_dark"),

  /** Sidebar primary text for dark mode - Text on highlighted sidebar items */
  colorSidebarPrimaryForegroundDark: text(
    "color_sidebar_primary_foreground_dark"
  ),

  /** Sidebar accent color for dark mode - Accent elements in sidebar */
  colorSidebarAccentDark: text("color_sidebar_accent_dark"),

  /** Sidebar accent text for dark mode - Text on accent sidebar elements */
  colorSidebarAccentForegroundDark: text(
    "color_sidebar_accent_foreground_dark"
  ),

  /** Sidebar border for dark mode - Border color in sidebar */
  colorSidebarBorderDark: text("color_sidebar_border_dark"),

  /** Sidebar focus ring for dark mode - Focus indicator color in sidebar */
  colorSidebarRingDark: text("color_sidebar_ring_dark"),

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
  logoSize: "1.0",
  titleSize: "1.0",
  // Leave all colors null by default - the app will use CSS variable defaults
  // This ensures the original theme is preserved

  // Light mode colors - all null to use defaults
  colorPrimaryLight: null,
  colorPrimaryHoverLight: null,
  colorSecondaryLight: null,
  colorAccentLight: null,
  colorBackgroundDarkestLight: null,
  colorBackgroundLightestLight: null,
  colorBackgroundGradientStartLight: null,
  colorBackgroundGradientEndLight: null,
  colorStateSuccessLight: null,
  colorStateSuccessBackgroundLight: null,
  colorStateWarningLight: null,
  colorStateWarningBackgroundLight: null,
  colorStateErrorLight: null,
  colorStateErrorBackgroundLight: null,
  colorGraphicsPrimaryLight: null,
  colorGraphicsSecondaryLight: null,
  colorGraphicsTertiaryLight: null,
  colorGraphicsQuaternaryLight: null,
  colorTextLight: null,
  colorTextContrastLight: null,
  colorBorderLight: null,
  colorMutedLight: null,
  colorSidebarLight: null,
  colorSidebarForegroundLight: null,
  colorSidebarPrimaryLight: null,
  colorSidebarPrimaryForegroundLight: null,
  colorSidebarAccentLight: null,
  colorSidebarAccentForegroundLight: null,
  colorSidebarBorderLight: null,
  colorSidebarRingLight: null,

  // Dark mode colors - all null to use defaults
  colorPrimaryDark: null,
  colorPrimaryHoverDark: null,
  colorSecondaryDark: null,
  colorAccentDark: null,
  colorBackgroundDarkestDark: null,
  colorBackgroundLightestDark: null,
  colorBackgroundGradientStartDark: null,
  colorBackgroundGradientEndDark: null,
  colorStateSuccessDark: null,
  colorStateSuccessBackgroundDark: null,
  colorStateWarningDark: null,
  colorStateWarningBackgroundDark: null,
  colorStateErrorDark: null,
  colorStateErrorBackgroundDark: null,
  colorGraphicsPrimaryDark: null,
  colorGraphicsSecondaryDark: null,
  colorGraphicsTertiaryDark: null,
  colorGraphicsQuaternaryDark: null,
  colorTextDark: null,
  colorTextContrastDark: null,
  colorBorderDark: null,
  colorMutedDark: null,
  colorSidebarDark: null,
  colorSidebarForegroundDark: null,
  colorSidebarPrimaryDark: null,
  colorSidebarPrimaryForegroundDark: null,
  colorSidebarAccentDark: null,
  colorSidebarAccentForegroundDark: null,
  colorSidebarBorderDark: null,
  colorSidebarRingDark: null,
} as const;
