"use client";

import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import * as React from "react";

/**
 * Branding Context
 *
 * Provides branding configuration to all components that need it.
 * Automatically returns the correct logos, colors, and assets based on
 * the current theme (light or dark mode).
 *
 * Components can use `useBranding()` to access theme-aware branding values.
 */

interface BrandingContextValue {
  /** Application title (shared across modes) */
  applicationTitle?: string | null;
  /** Logo size multiplier (default: 1.0) */
  logoSize?: string | null;
  /** Application title text size multiplier (default: 1.0) */
  titleSize?: string | null;
  /** Current theme's main logo */
  logoMain?: string | null;
  /** Current theme's sidebar logo */
  logoSidebar?: string | null;
  /** Current theme's favicon */
  logoFavicon?: string | null;
  /** Current theme's background image */
  background?: string | null;
  /** Light mode background (always available) */
  backgroundLight?: string | null;
  /** Dark mode background (always available) */
  backgroundDark?: string | null;
  /** Whether branding data is still loading */
  isLoading: boolean;
  /** Current theme mode */
  theme: "light" | "dark" | "system";
  /** Whether the current resolved theme is dark */
  isDarkMode: boolean;
}

const BrandingContext = React.createContext<BrandingContextValue>({
  isLoading: true,
  theme: "system",
  isDarkMode: false,
});

/**
 * Hook to access theme-aware branding configuration
 *
 * Returns the branding values appropriate for the current theme.
 * When the theme changes, the returned values automatically update.
 *
 * @returns Theme-aware branding configuration
 * @example
 * ```tsx
 * function Logo() {
 *   const { logoMain, isDarkMode } = useBranding();
 *   return <img src={logoMain} alt="Logo" />;
 * }
 * ```
 */
export function useBranding() {
  return React.useContext(BrandingContext);
}

export function BrandingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: branding, isLoading } = useQuery({
    ...orpc.branding.read.queryOptions(),
    throwOnError: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { theme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const value = React.useMemo<BrandingContextValue>(() => {
    // Return theme-specific values
    return {
      applicationTitle: branding?.applicationTitle,
      logoSize: branding?.logoSize,
      titleSize: branding?.titleSize,
      // Theme-aware assets (automatically switch based on theme)
      logoMain: isDarkMode ? branding?.logoMainDark : branding?.logoMainLight,
      logoSidebar: isDarkMode
        ? branding?.logoSidebarDark
        : branding?.logoSidebarLight,
      logoFavicon: isDarkMode
        ? branding?.logoFaviconDark
        : branding?.logoFaviconLight,
      background: isDarkMode
        ? branding?.backgroundDark
        : branding?.backgroundLight,
      // Always expose both backgrounds for explicit use
      backgroundLight: branding?.backgroundLight,
      backgroundDark: branding?.backgroundDark,
      isLoading,
      theme: theme as "light" | "dark" | "system",
      isDarkMode,
    };
  }, [branding, isLoading, theme, isDarkMode]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}
