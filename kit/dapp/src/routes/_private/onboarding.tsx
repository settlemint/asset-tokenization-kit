import { LanguageSwitcher } from "@/components/language/language-switcher";
import { DialogCardLayout } from "@/components/layout/dialog-card-layout";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/components/theme-toggle";
import { useThemeAssets } from "@/components/theme/hooks/use-theme-assets";
import { cn } from "@/lib/utils";
import { safeCssBackgroundImage } from "@/lib/utils/css-url";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
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

  return (
    <>
      <div
        className="h-screen w-screen bg-no-repeat bg-cover hidden dark:block"
        style={{ backgroundImage: safeBackgroundDarkUrl }}
      >
        <DialogCardLayout
          header={
            <div className="h-24">
              <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
                <div className={cn("flex w-full items-center gap-3")}>
                  <div className="flex h-12 w-48 items-center justify-center overflow-hidden rounded-lg text-sidebar-primary-foreground">
                    <Logo forcedColorMode="dark" className="h-12 w-48" />
                  </div>
                </div>
              </div>

              <div className="absolute top-8 right-8 flex gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          }
        >
          <Outlet />
        </DialogCardLayout>
      </div>
      <div
        className="h-screen w-screen bg-no-repeat bg-cover block dark:hidden"
        style={{ backgroundImage: safeBackgroundLightUrl }}
      >
        <DialogCardLayout
          header={
            <div className="h-24">
              <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
                <div className={cn("flex w-full items-center gap-3")}>
                  <div className="flex h-12 w-48 items-center justify-center overflow-hidden rounded-lg text-sidebar-primary-foreground">
                    <Logo forcedColorMode="dark" className="h-12 w-48" />
                  </div>
                </div>
              </div>

              <div className="absolute top-8 right-8 flex gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          }
        >
          <Outlet />
        </DialogCardLayout>
      </div>
    </>
  );
}
