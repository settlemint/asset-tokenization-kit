import { createOnboardingSearchSchema } from "@/components/onboarding/route-helpers";
import { updateOnboardingStateMachine } from "@/components/onboarding/state-machine";
import { WalletCreatedStep } from "@/components/onboarding/wallet/wallet-created-step";
import { WalletCreatingStep } from "@/components/onboarding/wallet/wallet-creating-step";
import { WalletIntroStep } from "@/components/onboarding/wallet/wallet-intro-step";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/_sidebar/wallet")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const { currentStep } = updateOnboardingStateMachine({ user });

    return {
      currentStep,
      user,
    };
  },
  component: OnboardingWalletComponent,
});

function OnboardingWalletComponent() {
  const subStep = Route.useSearch({
    select: (search) => search.subStep,
  });

  switch (subStep) {
    case "creating":
      return <WalletCreatingStep />;
    case "complete":
      return <WalletCreatedStep />;
    default:
      return <WalletIntroStep />;
  }
}
