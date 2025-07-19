import { OnboardingStep } from "@/components/onboarding/state-machine";
import { WalletCreated } from "@/components/onboarding/wallet/wallet-created";
import { WalletIntro } from "@/components/onboarding/wallet/wallet-intro";
import { WalletProgress } from "@/components/onboarding/wallet/wallet-progress";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-auth";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { authClient } from "@/lib/auth/auth.client";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { orpc } from "@/orpc/orpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_private/onboarding/_sidebar/wallet")({
  validateSearch: zodValidator(createOnboardingSearchSchema()),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.wallet),
  component: RouteComponent,
});

// TODO: The buttons need to be in a footer div at the bottom of the modal. If not step 1, it always needs a back button that goes to the previous step using the search params.
function RouteComponent() {
  const [isCreating, setIsCreating] = useState(false);
  const { subStep } = Route.useSearch();
  const { refetch } = useSession();
  const { completeStepAndNavigate } = useOnboardingNavigation();

  const { mutate: createWallet } = useMutation(
    orpc.user.createWallet.mutationOptions({
      onSuccess: async () => {
        // Clear auth session cache
        await authClient.getSession({
          query: {
            disableCookieCache: true,
          },
        });
        await refetch();

        // Wait for progress animation to complete
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setIsCreating(false);
      },
      onError: (error) => {
        setIsCreating(false);
        toast.error(error.message);
      },
    })
  );
  const { data: user } = useQuery({
    ...orpc.user.me.queryOptions(),
    // Keep query active to receive real-time updates
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });

  if (subStep === "complete") {
    return (
      <div>
        <WalletCreated />
        <footer>
          <Button
            onClick={() => void completeStepAndNavigate(OnboardingStep.wallet)}
          >
            Continue
          </Button>
        </footer>
      </div>
    );
  }

  if (
    !user?.wallet ||
    user.wallet === "0x0000000000000000000000000000000000000000" ||
    isCreating
  ) {
    return (
      <div>
        {isCreating ? <WalletProgress /> : <WalletIntro />}
        <footer>
          <Button
            onClick={() => {
              setIsCreating(true);
              createWallet({});
            }}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create my wallet"}
          </Button>
        </footer>
      </div>
    );
  }

  // If we have a wallet but subStep isn't "complete" yet, show wallet created with continue button
  return (
    <div>
      <WalletCreated />
      <footer>
        <Button
          onClick={() => void completeStepAndNavigate(OnboardingStep.wallet)}
        >
          Continue
        </Button>
      </footer>
    </div>
  );
}
