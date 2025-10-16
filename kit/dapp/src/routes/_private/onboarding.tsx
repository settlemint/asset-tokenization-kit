import { Logo } from "@/components/logo/logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { DialogCardLayout } from "@/components/layout/dialog-card-layout";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <div className="h-screen w-screen bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')] bg-no-repeat bg-cover">
      <DialogCardLayout
        header={
          <div className="flex-shrink-0 flex justify-between items-center p-4">
            <Logo
              variant="horizontal"
              forcedColorMode="light"
              className="h-8"
            />
            <div className="flex gap-2">
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
