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

import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/components/theme-toggle";
import { useThemeAssets } from "@/components/theme/hooks/use-theme-assets";
import { cn } from "@/lib/utils";
import { safeCssBackgroundImage } from "@/lib/utils/css-url";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";

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
  const { images } = useThemeAssets();

  const backgroundLightUrl =
    images.backgroundLightUrl ?? "/backgrounds/background-lm.svg";
  const backgroundDarkUrl =
    images.backgroundDarkUrl ?? "/backgrounds/background-dm.svg";

  const safeBackgroundLightUrl = useMemo(
    () => safeCssBackgroundImage(backgroundLightUrl),
    [backgroundLightUrl]
  );
  const safeBackgroundDarkUrl = useMemo(
    () => safeCssBackgroundImage(backgroundDarkUrl),
    [backgroundDarkUrl]
  );

  const backgroundStyles = useMemo(
    () => `
      :root {
        --auth-bg-image: ${safeBackgroundLightUrl};
      }
      .dark {
        --auth-bg-image: ${safeBackgroundDarkUrl};
      }
    `,
    [safeBackgroundLightUrl, safeBackgroundDarkUrl]
  );

  const inlineStyle = useMemo(
    () => ({
      backgroundImage: `var(--auth-bg-image, ${safeBackgroundLightUrl})`,
    }),
    [safeBackgroundLightUrl]
  );

  return (
    // Full-screen container with theme-aware background images
    <div className="min-h-screen w-full bg-center bg-cover" style={inlineStyle}>
      <style dangerouslySetInnerHTML={{ __html: backgroundStyles }} />

      {/* Optional auth page image overlay */}
      {(images.authLightUrl ?? images.authDarkUrl) ? (
        <div className="absolute inset-0 pointer-events-none">
          {images.authLightUrl ? (
            <img
              src={images.authLightUrl}
              alt="Authentication"
              className="block dark:hidden w-full h-full object-cover opacity-50"
            />
          ) : null}
          {images.authDarkUrl ? (
            <img
              src={images.authDarkUrl}
              alt="Authentication"
              className="hidden dark:block w-full h-full object-cover opacity-50"
            />
          ) : null}
        </div>
      ) : null}

      {/* Application branding - top left corner */}
      <div className="absolute top-8 left-8 flex flex-col items-end gap-0 z-10">
        <div className={cn("flex w-full items-center gap-3")}>
          <div className="flex h-12 w-48 items-center justify-center overflow-hidden rounded-lg text-sidebar-primary-foreground">
            <Logo forcedColorMode="dark" className="h-12 w-48" />
          </div>
        </div>
      </div>

      {/* User controls - top right corner */}
      <div className="absolute top-8 right-8 flex gap-2 z-10">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Centered content area for auth forms */}
      <div className="flex min-h-screen items-center justify-center relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
