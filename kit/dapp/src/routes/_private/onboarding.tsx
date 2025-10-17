import { LanguageSwitcher } from "@/components/language/language-switcher";
import { DialogCardLayout } from "@/components/layout/dialog-card-layout";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/components/theme-toggle";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <div className="h-screen w-screen bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')] bg-no-repeat bg-cover">
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
  );
}
