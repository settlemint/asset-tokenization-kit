import { z } from "zod";

/**
 * Schema for branding input (create/update operations)
 * All fields are optional to allow partial updates
 * Supports separate configurations for light and dark modes
 */
export const brandingInputSchema = z.object({
  applicationTitle: z.string().optional(),
  logoSize: z.string().optional(),
  titleSize: z.string().optional(),

  // Light mode assets
  logoMainLight: z.string().url().optional().nullable(),
  logoSidebarLight: z.string().url().optional().nullable(),
  logoFaviconLight: z.string().url().optional().nullable(),
  backgroundLight: z.string().url().optional().nullable(),

  // Dark mode assets
  logoMainDark: z.string().url().optional().nullable(),
  logoSidebarDark: z.string().url().optional().nullable(),
  logoFaviconDark: z.string().url().optional().nullable(),
  backgroundDark: z.string().url().optional().nullable(),

  // Light mode colors
  colorPrimaryLight: z.string().optional().nullable(),
  colorPrimaryHoverLight: z.string().optional().nullable(),
  colorSecondaryLight: z.string().optional().nullable(),
  colorAccentLight: z.string().optional().nullable(),
  colorBackgroundDarkestLight: z.string().optional().nullable(),
  colorBackgroundLightestLight: z.string().optional().nullable(),
  colorBackgroundGradientStartLight: z.string().optional().nullable(),
  colorBackgroundGradientEndLight: z.string().optional().nullable(),
  colorStateSuccessLight: z.string().optional().nullable(),
  colorStateSuccessBackgroundLight: z.string().optional().nullable(),
  colorStateWarningLight: z.string().optional().nullable(),
  colorStateWarningBackgroundLight: z.string().optional().nullable(),
  colorStateErrorLight: z.string().optional().nullable(),
  colorStateErrorBackgroundLight: z.string().optional().nullable(),
  colorGraphicsPrimaryLight: z.string().optional().nullable(),
  colorGraphicsSecondaryLight: z.string().optional().nullable(),
  colorGraphicsTertiaryLight: z.string().optional().nullable(),
  colorGraphicsQuaternaryLight: z.string().optional().nullable(),
  colorTextLight: z.string().optional().nullable(),
  colorTextContrastLight: z.string().optional().nullable(),
  colorBorderLight: z.string().optional().nullable(),
  colorMutedLight: z.string().optional().nullable(),
  colorSidebarLight: z.string().optional().nullable(),
  colorSidebarForegroundLight: z.string().optional().nullable(),
  colorSidebarPrimaryLight: z.string().optional().nullable(),
  colorSidebarPrimaryForegroundLight: z.string().optional().nullable(),
  colorSidebarAccentLight: z.string().optional().nullable(),
  colorSidebarAccentForegroundLight: z.string().optional().nullable(),
  colorSidebarBorderLight: z.string().optional().nullable(),
  colorSidebarRingLight: z.string().optional().nullable(),

  // Dark mode colors
  colorPrimaryDark: z.string().optional().nullable(),
  colorPrimaryHoverDark: z.string().optional().nullable(),
  colorSecondaryDark: z.string().optional().nullable(),
  colorAccentDark: z.string().optional().nullable(),
  colorBackgroundDarkestDark: z.string().optional().nullable(),
  colorBackgroundLightestDark: z.string().optional().nullable(),
  colorBackgroundGradientStartDark: z.string().optional().nullable(),
  colorBackgroundGradientEndDark: z.string().optional().nullable(),
  colorStateSuccessDark: z.string().optional().nullable(),
  colorStateSuccessBackgroundDark: z.string().optional().nullable(),
  colorStateWarningDark: z.string().optional().nullable(),
  colorStateWarningBackgroundDark: z.string().optional().nullable(),
  colorStateErrorDark: z.string().optional().nullable(),
  colorStateErrorBackgroundDark: z.string().optional().nullable(),
  colorGraphicsPrimaryDark: z.string().optional().nullable(),
  colorGraphicsSecondaryDark: z.string().optional().nullable(),
  colorGraphicsTertiaryDark: z.string().optional().nullable(),
  colorGraphicsQuaternaryDark: z.string().optional().nullable(),
  colorTextDark: z.string().optional().nullable(),
  colorTextContrastDark: z.string().optional().nullable(),
  colorBorderDark: z.string().optional().nullable(),
  colorMutedDark: z.string().optional().nullable(),
  colorSidebarDark: z.string().optional().nullable(),
  colorSidebarForegroundDark: z.string().optional().nullable(),
  colorSidebarPrimaryDark: z.string().optional().nullable(),
  colorSidebarPrimaryForegroundDark: z.string().optional().nullable(),
  colorSidebarAccentDark: z.string().optional().nullable(),
  colorSidebarAccentForegroundDark: z.string().optional().nullable(),
  colorSidebarBorderDark: z.string().optional().nullable(),
  colorSidebarRingDark: z.string().optional().nullable(),
});

export type BrandingInput = z.infer<typeof brandingInputSchema>;

/**
 * Schema for branding output (read operations)
 * Returns the full branding configuration with separate light/dark mode settings
 */
export const brandingOutputSchema = z.object({
  id: z.string().uuid(),
  applicationTitle: z.string().nullable(),
  logoSize: z.string().nullable(),
  titleSize: z.string().nullable(),

  // Light mode assets
  logoMainLight: z.string().nullable(),
  logoSidebarLight: z.string().nullable(),
  logoFaviconLight: z.string().nullable(),
  backgroundLight: z.string().nullable(),

  // Dark mode assets
  logoMainDark: z.string().nullable(),
  logoSidebarDark: z.string().nullable(),
  logoFaviconDark: z.string().nullable(),
  backgroundDark: z.string().nullable(),

  // Light mode colors
  colorPrimaryLight: z.string().nullable(),
  colorPrimaryHoverLight: z.string().nullable(),
  colorSecondaryLight: z.string().nullable(),
  colorAccentLight: z.string().nullable(),
  colorBackgroundDarkestLight: z.string().nullable(),
  colorBackgroundLightestLight: z.string().nullable(),
  colorBackgroundGradientStartLight: z.string().nullable(),
  colorBackgroundGradientEndLight: z.string().nullable(),
  colorStateSuccessLight: z.string().nullable(),
  colorStateSuccessBackgroundLight: z.string().nullable(),
  colorStateWarningLight: z.string().nullable(),
  colorStateWarningBackgroundLight: z.string().nullable(),
  colorStateErrorLight: z.string().nullable(),
  colorStateErrorBackgroundLight: z.string().nullable(),
  colorGraphicsPrimaryLight: z.string().nullable(),
  colorGraphicsSecondaryLight: z.string().nullable(),
  colorGraphicsTertiaryLight: z.string().nullable(),
  colorGraphicsQuaternaryLight: z.string().nullable(),
  colorTextLight: z.string().nullable(),
  colorTextContrastLight: z.string().nullable(),
  colorBorderLight: z.string().nullable(),
  colorMutedLight: z.string().nullable(),
  colorSidebarLight: z.string().nullable(),
  colorSidebarForegroundLight: z.string().nullable(),
  colorSidebarPrimaryLight: z.string().nullable(),
  colorSidebarPrimaryForegroundLight: z.string().nullable(),
  colorSidebarAccentLight: z.string().nullable(),
  colorSidebarAccentForegroundLight: z.string().nullable(),
  colorSidebarBorderLight: z.string().nullable(),
  colorSidebarRingLight: z.string().nullable(),

  // Dark mode colors
  colorPrimaryDark: z.string().nullable(),
  colorPrimaryHoverDark: z.string().nullable(),
  colorSecondaryDark: z.string().nullable(),
  colorAccentDark: z.string().nullable(),
  colorBackgroundDarkestDark: z.string().nullable(),
  colorBackgroundLightestDark: z.string().nullable(),
  colorBackgroundGradientStartDark: z.string().nullable(),
  colorBackgroundGradientEndDark: z.string().nullable(),
  colorStateSuccessDark: z.string().nullable(),
  colorStateSuccessBackgroundDark: z.string().nullable(),
  colorStateWarningDark: z.string().nullable(),
  colorStateWarningBackgroundDark: z.string().nullable(),
  colorStateErrorDark: z.string().nullable(),
  colorStateErrorBackgroundDark: z.string().nullable(),
  colorGraphicsPrimaryDark: z.string().nullable(),
  colorGraphicsSecondaryDark: z.string().nullable(),
  colorGraphicsTertiaryDark: z.string().nullable(),
  colorGraphicsQuaternaryDark: z.string().nullable(),
  colorTextDark: z.string().nullable(),
  colorTextContrastDark: z.string().nullable(),
  colorBorderDark: z.string().nullable(),
  colorMutedDark: z.string().nullable(),
  colorSidebarDark: z.string().nullable(),
  colorSidebarForegroundDark: z.string().nullable(),
  colorSidebarPrimaryDark: z.string().nullable(),
  colorSidebarPrimaryForegroundDark: z.string().nullable(),
  colorSidebarAccentDark: z.string().nullable(),
  colorSidebarAccentForegroundDark: z.string().nullable(),
  colorSidebarBorderDark: z.string().nullable(),
  colorSidebarRingDark: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BrandingOutput = z.infer<typeof brandingOutputSchema>;
