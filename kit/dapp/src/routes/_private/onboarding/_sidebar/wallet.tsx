import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { WalletCreated } from "@/components/onboarding/wallet/wallet-created";
import { WalletIntro } from "@/components/onboarding/wallet/wallet-intro";
import { WalletProgress } from "@/components/onboarding/wallet/wallet-progress";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_private/onboarding/_sidebar/wallet")({
  validateSearch: zodValidator(
    z.object({
      step: z.enum(Object.values(OnboardingStep)).optional(),
      subStep: z.enum(["intro", "complete"]).optional(),
    })
  ),
  beforeLoad: async ({
    context: { orpc, queryClient },
    search: { step, subStep },
  }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const { currentStep } = updateOnboardingStateMachine({ user });

    // If we're showing the complete subStep, don't redirect
    if (subStep === "complete") {
      return;
    }

    if (step) {
      if (step !== OnboardingStep.wallet) {
        throw redirect({
          to: `/onboarding/${step}`,
        });
      }
    } else {
      if (currentStep !== OnboardingStep.wallet) {
        throw redirect({
          to: `/onboarding/${currentStep}`,
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.fullPath });
  const [isCreating, setIsCreating] = useState(false);
  const { subStep } = Route.useSearch();
  const { refetch } = useSession();
  const { mutate: createWallet } = useMutation(
    orpc.user.createWallet.mutationOptions({
      onSuccess: async () => {
        await authClient.getSession({
          query: {
            disableCookieCache: true,
          },
        });
        await refetch();
        await queryClient.refetchQueries({
          queryKey: orpc.user.me.key(),
        });
        await new Promise((resolve) => setTimeout(resolve, 4000));
        setIsCreating(false);
        await navigate({
          search: () => ({ step: OnboardingStep.wallet, subStep: "complete" }),
        });
      },
      onError: (error) => {
        setIsCreating(false);
        toast.error(error.message);
      },
    })
  );
  const { data: user } = useQuery(orpc.user.me.queryOptions());

  if (subStep === "complete") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <WalletCreated />
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <footer className="flex justify-end">
            <Button
              onClick={async () => {
                await navigate({
                  to: `/onboarding/${OnboardingStep.walletSecurity}`,
                });
              }}
            >
              Continue
            </Button>
          </footer>
        </div>
      </div>
    );
  }

  if (
    !user?.wallet ||
    user.wallet === "0x0000000000000000000000000000000000000000" ||
    isCreating
  ) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {isCreating ? <WalletProgress /> : <WalletIntro />}
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <footer className="flex justify-end">
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
      </div>
    );
  }

  // If we have a wallet but subStep isn't "complete" yet, show wallet created with continue button
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <WalletCreated />
      </div>
      <div className="mt-8 pt-6 border-t border-border">
        <footer className="flex justify-end">
          <Button
            onClick={async () => {
              await navigate({
                to: `/onboarding/${OnboardingStep.walletSecurity}`,
              });
            }}
          >
            Continue
          </Button>
        </footer>
      </div>
    </div>
  );
}