"use client";

import { BrandingContextProvider } from "@/components/branding/branding-context";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

/**
 * Branding Provider
 *
 * Fetches and applies branding configuration globally:
 * - Updates document title
 * - Applies CSS custom properties for colors
 * - Updates favicon
 * - Manages background images
 *
 * This provider should be placed high in the component tree to ensure
 * branding is applied before the app renders.
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

  // Apply branding settings when they change
  React.useEffect(() => {
    if (!branding) {
      console.log("[Branding] No branding data available yet");
      return;
    }

    console.log("[Branding] Applying branding settings", { branding });

    // Update document title
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

    // Update favicon
    if (branding.logoFavicon) {
      const favicon = document.querySelector(
        "link[rel='icon']"
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.logoFavicon;
      } else {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = branding.logoFavicon;
        document.head.appendChild(newFavicon);
      }
    }

    // Apply color CSS custom properties
    const root = document.documentElement;

    // Helper to set CSS variable if value exists
    const setCssVar = (varName: string, value: string | null | undefined) => {
      if (value) {
        root.style.setProperty(varName, value);
      }
    };

    // Primary colors
    setCssVar("--sm-accent", branding.colorPrimary);
    setCssVar("--sm-accent-hover", branding.colorPrimaryHover);

    // Background colors
    setCssVar("--sm-background-darkest", branding.colorBackgroundDarkest);
    setCssVar("--sm-background-lightest", branding.colorBackgroundLightest);
    setCssVar(
      "--sm-background-gradient-start",
      branding.colorBackgroundGradientStart
    );
    setCssVar(
      "--sm-background-gradient-end",
      branding.colorBackgroundGradientEnd
    );

    // State colors
    setCssVar("--sm-state-success", branding.colorStateSuccess);
    setCssVar(
      "--sm-state-success-background",
      branding.colorStateSuccessBackground
    );
    setCssVar("--sm-state-warning", branding.colorStateWarning);
    setCssVar(
      "--sm-state-warning-background",
      branding.colorStateWarningBackground
    );
    setCssVar("--sm-state-error", branding.colorStateError);
    setCssVar(
      "--sm-state-error-background",
      branding.colorStateErrorBackground
    );

    // Graphics colors
    setCssVar("--sm-graphics-primary", branding.colorGraphicsPrimary);
    setCssVar("--sm-graphics-secondary", branding.colorGraphicsSecondary);
    setCssVar("--sm-graphics-tertiary", branding.colorGraphicsTertiary);
    setCssVar("--sm-graphics-quaternary", branding.colorGraphicsQuaternary);

    // Text and border colors
    setCssVar("--sm-text", branding.colorText);
    setCssVar("--sm-text-contrast", branding.colorTextContrast);
    setCssVar("--sm-border", branding.colorBorder);
    setCssVar("--sm-muted", branding.colorMuted);

    // Secondary color
    setCssVar("--sm-graphics-primary", branding.colorSecondary);

    // Sidebar colors
    setCssVar("--sidebar", branding.colorSidebar);
    setCssVar("--sidebar-foreground", branding.colorSidebarForeground);
    setCssVar("--sidebar-primary", branding.colorSidebarPrimary);
    setCssVar(
      "--sidebar-primary-foreground",
      branding.colorSidebarPrimaryForeground
    );
    setCssVar("--sidebar-accent", branding.colorSidebarAccent);
    setCssVar(
      "--sidebar-accent-foreground",
      branding.colorSidebarAccentForeground
    );
    setCssVar("--sidebar-border", branding.colorSidebarBorder);
    setCssVar("--sidebar-ring", branding.colorSidebarRing);

    // Background images for onboarding
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

    console.log("[Branding] Applied branding settings", {
      applicationTitle: branding.applicationTitle,
      hasLogoMain: !!branding.logoMain,
      hasLogoSidebar: !!branding.logoSidebar,
      hasLogoFavicon: !!branding.logoFavicon,
      hasBackgroundLight: !!branding.backgroundLight,
      hasBackgroundDark: !!branding.backgroundDark,
      hasColors: !!(branding.colorPrimary || branding.colorSecondary),
      hasSidebarColors: !!branding.colorSidebar,
    });
  }, [branding]);

  return <BrandingContextProvider>{children}</BrandingContextProvider>;
}
