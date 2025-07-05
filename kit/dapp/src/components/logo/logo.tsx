/**
 * Application Logo Component
 *
 * This module provides a flexible logo component that adapts to different display
 * contexts and theme settings. It supports multiple logo variants and automatically
 * switches between light and dark versions based on the current theme.
 *
 * The component handles theme-aware logo rendering, ensuring the logo remains
 * visible and aesthetically appropriate across different color schemes.
 * @see {@link https://github.com/pacocoursey/next-themes} - Next Themes for theme detection
 */
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import type { PropsWithChildren } from "react";

/**
 * Props for the Logo component.
 */
interface LogoProps {
  /**
   * Additional CSS classes to apply to the logo container.
   * Useful for controlling size, positioning, or adding custom styles.
   */
  className?: string;

  /**
   * Logo variant to display.
   * - "horizontal": Wide logo with text beside the icon (default)
   * - "vertical": Stacked logo with text below the icon
   * - "icon": Icon-only logo without text
   */
  variant?: "horizontal" | "vertical" | "icon";

  /**
   * Force a specific color mode regardless of the current theme.
   * Useful when the logo appears on a contrasting background.
   * - "light": Use light mode logo
   * - "dark": Use dark mode logo
   * - undefined: Auto-detect based on theme (default)
   */
  forcedColorMode?: "light" | "dark";
}

/**
 * Logo component that displays the application's branding.
 *
 * This component renders the SettleMint logo with automatic theme adaptation
 * and support for different layout variants. It intelligently selects the
 * appropriate logo file based on:
 * - Current theme (light/dark)
 * - Requested variant (horizontal/vertical/icon)
 * - Forced color mode override
 *
 * The logo files are expected to be in the `/public/logos/` directory with
 * the following naming convention:
 * - `settlemint-logo-{variant}-{mode}.svg`
 * - Where variant is: h (horizontal), v (vertical), or i (icon)
 * - Where mode is: lm (light mode) or dm (dark mode)
 * @example
 * ```tsx
 * // Default horizontal logo
 * <Logo />
 *
 * // Icon-only logo with custom size
 * <Logo variant="icon" className="w-8 h-8" />
 *
 * // Force dark mode logo on light background
 * <Logo forcedColorMode="dark" />
 *
 * // Vertical logo for mobile layouts
 * <Logo variant="vertical" className="max-w-[200px]" />
 * ```
 */
export function Logo({
  className = "",
  variant = "horizontal",
  forcedColorMode,
}: PropsWithChildren<LogoProps>) {
  const { resolvedTheme } = useTheme();

  /**
   * Determines the appropriate logo file path based on theme and variant.
   * Prioritizes forcedColorMode over the detected theme when specified.
   */
  const getLogoSrc = () => {
    // Check if dark mode should be used (either from theme or forced)
    const isDark =
      forcedColorMode === "dark" ||
      (forcedColorMode !== "light" && resolvedTheme === "dark");

    // Select logo file based on variant and color mode
    switch (variant) {
      case "horizontal":
        return isDark
          ? "/logos/settlemint-logo-h-dm.svg"
          : "/logos/settlemint-logo-h-lm.svg";
      case "vertical":
        return isDark
          ? "/logos/settlemint-logo-v-dm.svg"
          : "/logos/settlemint-logo-v-lm.svg";
      case "icon":
        return isDark
          ? "/logos/settlemint-logo-i-dm.svg"
          : "/logos/settlemint-logo-i-lm.svg";
      default:
        // Fallback to horizontal light mode logo
        return "/logos/settlemint-logo-h-lm.svg";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <img src={getLogoSrc()} alt="SettleMint" className="h-full w-full" />
    </div>
  );
}
