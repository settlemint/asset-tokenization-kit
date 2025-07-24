import { RecoveryCodes } from "@/components/onboarding/recovery-codes/recovery-codes";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-recovery-codes"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.walletRecoveryCodes),
  component: WalletRecoveryCodesComponent,
});

function WalletRecoveryCodesComponent() {
  return <RecoveryCodes />;
}
