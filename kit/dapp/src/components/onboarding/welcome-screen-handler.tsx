import { WelcomeScreen } from "@/components/onboarding/steps";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import type { OnboardingType } from "@/lib/types/onboarding";
import type { SessionUser } from "@/lib/auth";
import { getAllowedOnboardingTypes } from "./onboarding-utils";

interface WelcomeScreenHandlerProps {
  showWelcome: boolean;
  onContinue: () => void;
  user?: SessionUser;
}

export function WelcomeScreenHandler({
  showWelcome,
  onContinue,
  user,
}: WelcomeScreenHandlerProps) {
  const allowedTypes = getAllowedOnboardingTypes(user);

  if (!showWelcome) return null;

  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
      <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
        <div className="px-6 sm:px-12 pt-6 flex justify-between">
          <div>{/* Logo and branding section */}</div>
        </div>
        <div className="flex items-center justify-center min-h-[calc(100vh-88px)]">
          <WelcomeScreen onContinue={onContinue} />
        </div>
      </div>
    </OnboardingGuard>
  );
}
