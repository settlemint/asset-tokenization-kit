/**
 * Authentication Layout Route
 *
 * This module defines the layout wrapper for all authentication pages,
 * providing a consistent visual design and user experience across login,
 * registration, and other auth flows.
 *
 * The layout features:
 * - Full-screen background with theme-aware imagery
 * - Application branding in the top-left corner
 * - User controls (language switcher, theme toggle) in the top-right
 * - Centered content area for authentication forms
 *
 * This route serves as a parent for all /auth/* routes, ensuring they
 * share the same visual styling and layout structure.
 * @see {@link ./auth.$pathname} - Dynamic auth route for specific auth pages
 */

import { useBranding } from "@/components/branding/branding-context";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/auth")({
  component: LayoutComponent,
});

/**
 * Layout component for authentication pages.
 *
 * Creates a branded, full-screen authentication experience with:
 * - Theme-aware background images that switch between light and dark modes
 * - Application logo and name prominently displayed
 * - Global controls for language and theme preferences
 * - Centered content area for child route components
 *
 * The layout ensures authentication pages feel integrated with the
 * application while maintaining a focused, distraction-free environment
 * for security-sensitive operations.
 */
function LayoutComponent() {
  const { t } = useTranslation("common");
  const { background, applicationTitle, logoSize, titleSize } = useBranding();

  // Use branding background if available, otherwise fallback to default
  const backgroundStyle = background
    ? { backgroundImage: `url("${background}")` }
    : {};

  // Get size multipliers
  const logoSizeMultiplier = logoSize ? parseFloat(logoSize) : 1.0;
  const titleSizeMultiplier = titleSize ? parseFloat(titleSize) : 1.0;

  return (
    // Full-screen container with theme-aware background images
    <div
      className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]"
      style={backgroundStyle}
    >
      {/* Application branding - top left corner */}
      <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
        <div className={cn("flex w-full items-center gap-3")}>
          <div
            className="flex aspect-square items-center justify-center rounded-lg text-sidebar-primary-foreground"
            style={{
              width: `${logoSizeMultiplier * 2}rem`,
              height: `${logoSizeMultiplier * 2}rem`,
            }}
          >
            <Logo variant="icon" forcedColorMode="dark" />
          </div>
          <div className="flex flex-col text-foreground leading-none">
            <span
              className="font-bold text-primary-foreground"
              style={{ fontSize: `${titleSizeMultiplier * 1.125}rem` }}
            >
              {applicationTitle || "SettleMint"}
            </span>
            <span
              className="-mt-1 overflow-hidden truncate text-ellipsis leading-snug text-primary-foreground dark:text-foreground"
              style={{ fontSize: `${titleSizeMultiplier * 0.875}rem` }}
            >
              {t("appDescription")}
            </span>
          </div>
        </div>
      </div>

      {/* User controls - top right corner */}
      <div className="absolute top-8 right-8 flex gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Centered content area for auth forms */}
      <div className="flex min-h-screen items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
