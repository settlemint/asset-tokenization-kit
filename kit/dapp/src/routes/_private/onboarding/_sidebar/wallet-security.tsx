import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { SecurityMethodSelector } from "@/components/onboarding/wallet-security/security-method-selector";
import { SecuritySuccess } from "@/components/onboarding/wallet-security/security-success";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-security"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.walletSecurity),
  component: SetupWalletSecurityComponent,
});

function SetupWalletSecurityComponent() {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  if (!user.onboardingState.walletSecurity) {
    return <SecurityMethodSelector />;
  }

  return <SecuritySuccess />;
}
