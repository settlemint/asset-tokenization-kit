import { OnboardingStep } from "@/components/onboarding/state-machine";
import { OtpSetupComponent } from "@/components/onboarding/wallet-security/otp-setup-component";
import { PinSetupComponent } from "@/components/onboarding/wallet-security/pin-setup-component";
import { SecurityMethodSelector } from "@/components/onboarding/wallet-security/security-method-selector";
import { SecuritySuccess } from "@/components/onboarding/wallet-security/security-success";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-security"
)({
  validateSearch: zodValidator(
    createOnboardingSearchSchema(["intro", "pin", "otp", "complete"] as const)
  ),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.walletSecurity),
  component: RouteComponent,
});

function RouteComponent() {
  const subStep = Route.useSearch({
    select: (search) => search.subStep,
  });
  const { handleMutationSuccess, completeStepAndNavigate, navigateToSubStep } =
    useOnboardingNavigation();

  const handleSecuritySuccess = () =>
    void handleMutationSuccess(OnboardingStep.walletSecurity, "complete");

  const onNext = () =>
    void completeStepAndNavigate(OnboardingStep.walletSecurity);

  if (subStep === "complete") {
    return <SecuritySuccess onNext={onNext} />;
  }

  if (subStep === "pin") {
    return (
      <PinSetupComponent
        onSuccess={handleSecuritySuccess}
        onBack={() =>
          void navigateToSubStep(OnboardingStep.walletSecurity, "intro")
        }
      />
    );
  }

  if (subStep === "otp") {
    return (
      <OtpSetupComponent
        onSuccess={handleSecuritySuccess}
        onBack={() =>
          void navigateToSubStep(OnboardingStep.walletSecurity, "intro")
        }
      />
    );
  }

  return (
    <SecurityMethodSelector
      onSetupSecurity={(method) =>
        void navigateToSubStep(OnboardingStep.walletSecurity, method)
      }
    />
  );
}
