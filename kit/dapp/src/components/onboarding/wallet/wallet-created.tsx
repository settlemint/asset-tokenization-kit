import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleCheckBigIcon } from "lucide-react";

export function WalletCreated() {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());
  const { completeStepAndNavigate } = useOnboardingNavigation();

  return (
    <>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CircleCheckBigIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-base text-muted-foreground">
              Congratulations! Your Web3 wallet has been successfully created
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium text-foreground">
            This is your wallet address
          </h3>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Web3Address
                address={
                  user.wallet ?? "0x0000000000000000000000000000000000000000"
                }
                showPrettyName={false}
                showFullAddress
              />
            </div>
          </div>
        </div>
      </div>
      <footer>
        <Button
          onClick={() => void completeStepAndNavigate(OnboardingStep.wallet)}
        >
          Continue
        </Button>
      </footer>
    </>
  );
}
