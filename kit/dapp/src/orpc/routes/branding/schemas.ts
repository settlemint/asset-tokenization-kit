import { z } from "zod";

/**
 * Schema for branding input (create/update operations)
 * All fields are optional to allow partial updates
 */
export const brandingInputSchema = z.object({
  applicationTitle: z.string().optional(),
  logoMain: z.string().url().optional().nullable(),
  logoSidebar: z.string().url().optional().nullable(),
  logoFavicon: z.string().url().optional().nullable(),
  backgroundLight: z.string().url().optional().nullable(),
  backgroundDark: z.string().url().optional().nullable(),
  colorPrimary: z.string().optional().nullable(),
  colorPrimaryHover: z.string().optional().nullable(),
  colorSecondary: z.string().optional().nullable(),
  colorAccent: z.string().optional().nullable(),
  colorBackgroundDarkest: z.string().optional().nullable(),
  colorBackgroundLightest: z.string().optional().nullable(),
  colorBackgroundGradientStart: z.string().optional().nullable(),
  colorBackgroundGradientEnd: z.string().optional().nullable(),
  colorStateSuccess: z.string().optional().nullable(),
  colorStateSuccessBackground: z.string().optional().nullable(),
  colorStateWarning: z.string().optional().nullable(),
  colorStateWarningBackground: z.string().optional().nullable(),
  colorStateError: z.string().optional().nullable(),
  colorStateErrorBackground: z.string().optional().nullable(),
  colorGraphicsPrimary: z.string().optional().nullable(),
  colorGraphicsSecondary: z.string().optional().nullable(),
  colorGraphicsTertiary: z.string().optional().nullable(),
  colorGraphicsQuaternary: z.string().optional().nullable(),
  colorText: z.string().optional().nullable(),
  colorTextContrast: z.string().optional().nullable(),
  colorBorder: z.string().optional().nullable(),
  colorMuted: z.string().optional().nullable(),
  colorSidebar: z.string().optional().nullable(),
  colorSidebarForeground: z.string().optional().nullable(),
  colorSidebarPrimary: z.string().optional().nullable(),
  colorSidebarPrimaryForeground: z.string().optional().nullable(),
  colorSidebarAccent: z.string().optional().nullable(),
  colorSidebarAccentForeground: z.string().optional().nullable(),
  colorSidebarBorder: z.string().optional().nullable(),
  colorSidebarRing: z.string().optional().nullable(),
});

export type BrandingInput = z.infer<typeof brandingInputSchema>;

/**
 * Schema for branding output (read operations)
 * Returns the full branding configuration
 */
export const brandingOutputSchema = z.object({
  id: z.string().uuid(),
  applicationTitle: z.string().nullable(),
  logoMain: z.string().nullable(),
  logoSidebar: z.string().nullable(),
  logoFavicon: z.string().nullable(),
  backgroundLight: z.string().nullable(),
  backgroundDark: z.string().nullable(),
  colorPrimary: z.string().nullable(),
  colorPrimaryHover: z.string().nullable(),
  colorSecondary: z.string().nullable(),
  colorAccent: z.string().nullable(),
  colorBackgroundDarkest: z.string().nullable(),
  colorBackgroundLightest: z.string().nullable(),
  colorBackgroundGradientStart: z.string().nullable(),
  colorBackgroundGradientEnd: z.string().nullable(),
  colorStateSuccess: z.string().nullable(),
  colorStateSuccessBackground: z.string().nullable(),
  colorStateWarning: z.string().nullable(),
  colorStateWarningBackground: z.string().nullable(),
  colorStateError: z.string().nullable(),
  colorStateErrorBackground: z.string().nullable(),
  colorGraphicsPrimary: z.string().nullable(),
  colorGraphicsSecondary: z.string().nullable(),
  colorGraphicsTertiary: z.string().nullable(),
  colorGraphicsQuaternary: z.string().nullable(),
  colorText: z.string().nullable(),
  colorTextContrast: z.string().nullable(),
  colorBorder: z.string().nullable(),
  colorMuted: z.string().nullable(),
  colorSidebar: z.string().nullable(),
  colorSidebarForeground: z.string().nullable(),
  colorSidebarPrimary: z.string().nullable(),
  colorSidebarPrimaryForeground: z.string().nullable(),
  colorSidebarAccent: z.string().nullable(),
  colorSidebarAccentForeground: z.string().nullable(),
  colorSidebarBorder: z.string().nullable(),
  colorSidebarRing: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BrandingOutput = z.infer<typeof brandingOutputSchema>;
