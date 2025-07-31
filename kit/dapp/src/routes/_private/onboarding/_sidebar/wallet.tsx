import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { CreateWallet } from "@/components/onboarding/wallet/wallet-create";
import { WalletCreated } from "@/components/onboarding/wallet/wallet-created";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/_sidebar/wallet")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.wallet),
  component: CreateWalletComponent,
});

function CreateWalletComponent() {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  if (!user.onboardingState.wallet) {
    return <CreateWallet />;
  }

  return <WalletCreated />;
}
