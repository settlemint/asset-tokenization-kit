"use client";

import { BrandingContextProvider } from "@/components/branding/branding-context";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import * as React from "react";

/**
 * Branding Provider
 *
 * Fetches and applies branding configuration globally with full light/dark mode support:
 * - Updates document title (shared across modes)
 * - Applies CSS custom properties for colors (theme-specific)
 * - Updates favicon (theme-specific)
 * - Manages background images (theme-specific)
 *
 * This provider listens to theme changes and automatically switches between
 * light and dark mode branding configurations.
 */

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: branding } = useQuery({
    ...orpc.branding.read.queryOptions(),
    // Don't fail the entire app if branding fails to load
    throwOnError: false,
    // Cache branding for a long time since it rarely changes
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Apply branding settings when they change or theme changes
  React.useEffect(() => {
    if (!branding) {
      console.log("[Branding] No branding data available yet");
      return;
    }

    console.log("[Branding] Applying branding settings", {
      branding,
      theme: isDarkMode ? "dark" : "light",
    });

    // Update document title (shared across modes)
    if (branding.applicationTitle) {
      const newTitle = branding.applicationTitle;
      document.title = newTitle;
      console.log("[Branding] Updated document title to:", newTitle);

      // Also update meta tags
      let titleMeta = document.querySelector(
        'meta[property="og:title"]'
      ) as HTMLMetaElement;
      if (titleMeta) {
        titleMeta.content = newTitle;
      } else {
        titleMeta = document.createElement("meta");
        titleMeta.setAttribute("property", "og:title");
        titleMeta.content = newTitle;
        document.head.appendChild(titleMeta);
      }
    }

    // Update favicon based on current theme
    const faviconUrl = isDarkMode
      ? branding.logoFaviconDark
      : branding.logoFaviconLight;
    if (faviconUrl) {
      const favicon = document.querySelector(
        "link[rel='icon']"
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = faviconUrl;
      } else {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }

    // Apply color CSS custom properties based on current theme
    const root = document.documentElement;

    // Helper to set CSS variable if value exists
    const setCssVar = (varName: string, value: string | null | undefined) => {
      if (value) {
        root.style.setProperty(varName, value);
      }
    };

    // Get the appropriate color values based on theme
    const colors = {
      primary: isDarkMode
        ? branding.colorPrimaryDark
        : branding.colorPrimaryLight,
      primaryHover: isDarkMode
        ? branding.colorPrimaryHoverDark
        : branding.colorPrimaryHoverLight,
      secondary: isDarkMode
        ? branding.colorSecondaryDark
        : branding.colorSecondaryLight,
      accent: isDarkMode ? branding.colorAccentDark : branding.colorAccentLight,
      backgroundDarkest: isDarkMode
        ? branding.colorBackgroundDarkestDark
        : branding.colorBackgroundDarkestLight,
      backgroundLightest: isDarkMode
        ? branding.colorBackgroundLightestDark
        : branding.colorBackgroundLightestLight,
      backgroundGradientStart: isDarkMode
        ? branding.colorBackgroundGradientStartDark
        : branding.colorBackgroundGradientStartLight,
      backgroundGradientEnd: isDarkMode
        ? branding.colorBackgroundGradientEndDark
        : branding.colorBackgroundGradientEndLight,
      stateSuccess: isDarkMode
        ? branding.colorStateSuccessDark
        : branding.colorStateSuccessLight,
      stateSuccessBackground: isDarkMode
        ? branding.colorStateSuccessBackgroundDark
        : branding.colorStateSuccessBackgroundLight,
      stateWarning: isDarkMode
        ? branding.colorStateWarningDark
        : branding.colorStateWarningLight,
      stateWarningBackground: isDarkMode
        ? branding.colorStateWarningBackgroundDark
        : branding.colorStateWarningBackgroundLight,
      stateError: isDarkMode
        ? branding.colorStateErrorDark
        : branding.colorStateErrorLight,
      stateErrorBackground: isDarkMode
        ? branding.colorStateErrorBackgroundDark
        : branding.colorStateErrorBackgroundLight,
      graphicsPrimary: isDarkMode
        ? branding.colorGraphicsPrimaryDark
        : branding.colorGraphicsPrimaryLight,
      graphicsSecondary: isDarkMode
        ? branding.colorGraphicsSecondaryDark
        : branding.colorGraphicsSecondaryLight,
      graphicsTertiary: isDarkMode
        ? branding.colorGraphicsTertiaryDark
        : branding.colorGraphicsTertiaryLight,
      graphicsQuaternary: isDarkMode
        ? branding.colorGraphicsQuaternaryDark
        : branding.colorGraphicsQuaternaryLight,
      text: isDarkMode ? branding.colorTextDark : branding.colorTextLight,
      textContrast: isDarkMode
        ? branding.colorTextContrastDark
        : branding.colorTextContrastLight,
      border: isDarkMode ? branding.colorBorderDark : branding.colorBorderLight,
      muted: isDarkMode ? branding.colorMutedDark : branding.colorMutedLight,
      sidebar: isDarkMode
        ? branding.colorSidebarDark
        : branding.colorSidebarLight,
      sidebarForeground: isDarkMode
        ? branding.colorSidebarForegroundDark
        : branding.colorSidebarForegroundLight,
      sidebarPrimary: isDarkMode
        ? branding.colorSidebarPrimaryDark
        : branding.colorSidebarPrimaryLight,
      sidebarPrimaryForeground: isDarkMode
        ? branding.colorSidebarPrimaryForegroundDark
        : branding.colorSidebarPrimaryForegroundLight,
      sidebarAccent: isDarkMode
        ? branding.colorSidebarAccentDark
        : branding.colorSidebarAccentLight,
      sidebarAccentForeground: isDarkMode
        ? branding.colorSidebarAccentForegroundDark
        : branding.colorSidebarAccentForegroundLight,
      sidebarBorder: isDarkMode
        ? branding.colorSidebarBorderDark
        : branding.colorSidebarBorderLight,
      sidebarRing: isDarkMode
        ? branding.colorSidebarRingDark
        : branding.colorSidebarRingLight,
    };

    // Apply primary colors
    setCssVar("--sm-accent", colors.primary);
    setCssVar("--sm-accent-hover", colors.primaryHover);
    setCssVar("--sm-graphics-primary", colors.secondary);

    // Background colors
    setCssVar("--sm-background-darkest", colors.backgroundDarkest);
    setCssVar("--sm-background-lightest", colors.backgroundLightest);
    setCssVar("--sm-background-gradient-start", colors.backgroundGradientStart);
    setCssVar("--sm-background-gradient-end", colors.backgroundGradientEnd);

    // State colors
    setCssVar("--sm-state-success", colors.stateSuccess);
    setCssVar("--sm-state-success-background", colors.stateSuccessBackground);
    setCssVar("--sm-state-warning", colors.stateWarning);
    setCssVar("--sm-state-warning-background", colors.stateWarningBackground);
    setCssVar("--sm-state-error", colors.stateError);
    setCssVar("--sm-state-error-background", colors.stateErrorBackground);

    // Graphics colors
    setCssVar("--sm-graphics-primary", colors.graphicsPrimary);
    setCssVar("--sm-graphics-secondary", colors.graphicsSecondary);
    setCssVar("--sm-graphics-tertiary", colors.graphicsTertiary);
    setCssVar("--sm-graphics-quaternary", colors.graphicsQuaternary);

    // Text and border colors
    setCssVar("--sm-text", colors.text);
    setCssVar("--sm-text-contrast", colors.textContrast);
    setCssVar("--sm-border", colors.border);
    setCssVar("--sm-muted", colors.muted);

    // Sidebar colors
    setCssVar("--sidebar", colors.sidebar);
    setCssVar("--sidebar-foreground", colors.sidebarForeground);
    setCssVar("--sidebar-primary", colors.sidebarPrimary);
    setCssVar("--sidebar-primary-foreground", colors.sidebarPrimaryForeground);
    setCssVar("--sidebar-accent", colors.sidebarAccent);
    setCssVar("--sidebar-accent-foreground", colors.sidebarAccentForeground);
    setCssVar("--sidebar-border", colors.sidebarBorder);
    setCssVar("--sidebar-ring", colors.sidebarRing);

    // Background images for onboarding (theme-specific)
    if (branding.backgroundLight) {
      root.style.setProperty(
        "--onboarding-background-light",
        `url("${branding.backgroundLight}")`
      );
    }
    if (branding.backgroundDark) {
      root.style.setProperty(
        "--onboarding-background-dark",
        `url("${branding.backgroundDark}")`
      );
    }

    console.log("[Branding] Applied theme-specific branding settings", {
      applicationTitle: branding.applicationTitle,
      theme: isDarkMode ? "dark" : "light",
      hasLogoMainLight: !!branding.logoMainLight,
      hasLogoMainDark: !!branding.logoMainDark,
      hasLogoSidebarLight: !!branding.logoSidebarLight,
      hasLogoSidebarDark: !!branding.logoSidebarDark,
      hasLogoFaviconLight: !!branding.logoFaviconLight,
      hasLogoFaviconDark: !!branding.logoFaviconDark,
      hasBackgroundLight: !!branding.backgroundLight,
      hasBackgroundDark: !!branding.backgroundDark,
      hasColorsLight: !!(
        branding.colorPrimaryLight || branding.colorSecondaryLight
      ),
      hasColorsDark: !!(
        branding.colorPrimaryDark || branding.colorSecondaryDark
      ),
      hasSidebarColorsLight: !!branding.colorSidebarLight,
      hasSidebarColorsDark: !!branding.colorSidebarDark,
    });
  }, [branding, isDarkMode]);

  return <BrandingContextProvider>{children}</BrandingContextProvider>;
}
