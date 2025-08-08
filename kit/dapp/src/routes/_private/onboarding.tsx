import { AssetTokenizationKitLogo } from "@/components/asset-tokenization-kit-logo";
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
            <AssetTokenizationKitLogo className="text-primary-foreground" />
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
