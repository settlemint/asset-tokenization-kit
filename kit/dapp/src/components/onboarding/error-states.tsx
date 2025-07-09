import { Button } from "@/components/ui/button";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import type { OnboardingType } from "@/lib/types/onboarding";

interface NoStepsAvailableProps {
  steps: unknown[];
  groups: unknown[];
  shouldShowWalletSteps: boolean;
  shouldShowSystemSetupSteps: boolean;
  shouldShowIdentitySteps: boolean;
  systemAddress: string | null | undefined;
  onBackToWelcome: () => void;
  allowedTypes: OnboardingType[];
}

export function NoStepsAvailable({
  steps,
  groups,
  shouldShowWalletSteps,
  shouldShowSystemSetupSteps,
  shouldShowIdentitySteps,
  systemAddress,
  onBackToWelcome,
  allowedTypes,
}: NoStepsAvailableProps) {
  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
      <div className="min-h-screen w-full flex items-center justify-center bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
        <div className="text-center p-8 bg-background/80 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">No Steps Available</h2>
          <p className="text-muted-foreground mb-4">
            Debug Info: Steps: {steps.length}, Groups: {groups.length}
          </p>
          <p className="text-sm text-muted-foreground">
            shouldShowWalletSteps: {String(shouldShowWalletSteps)}
            <br />
            shouldShowSystemSetupSteps: {String(shouldShowSystemSetupSteps)}
            <br />
            shouldShowIdentitySteps: {String(shouldShowIdentitySteps)}
            <br />
            systemAddress: {systemAddress ?? "null"}
          </p>
          <Button onClick={onBackToWelcome} className="mt-4">
            Back to Welcome
          </Button>
        </div>
      </div>
    </OnboardingGuard>
  );
}

interface ErrorLoadingStepsProps {
  error: Error;
  onBackToWelcome: () => void;
  allowedTypes: OnboardingType[];
}

export function ErrorLoadingSteps({
  error,
  onBackToWelcome,
  allowedTypes,
}: ErrorLoadingStepsProps) {
  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
      <div className="min-h-screen w-full flex items-center justify-center bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
        <div className="text-center p-8 bg-background/80 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Error Loading Steps</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={onBackToWelcome} className="mt-4">
            Back to Welcome
          </Button>
        </div>
      </div>
    </OnboardingGuard>
  );
}
