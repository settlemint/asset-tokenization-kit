import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function WalletIntroStep() {
  const navigate = useNavigate();
  const { refreshUserState } = useOnboardingNavigation();
  const { mutate: createWallet } = useMutation(
    orpc.user.createWallet.mutationOptions({
      onSuccess: async () => {
        await refreshUserState();
        void navigate({
          to: "/onboarding/wallet",
          search: { subStep: "creating" },
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  return (
    <div>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Your Wallet</h2>
          <p className="text-sm text-muted-foreground pt-2">
            Your Digital Key to the Blockchain
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-6 pr-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Your Digital Key to the Blockchain
                </h3>
                <p className="text-base text-foreground leading-relaxed">
                  Think of your wallet as your master key that unlocks all your
                  digital assets and identity on the blockchain. It's a secure
                  set of cryptographic codes that proves you own your tokens and
                  allows you to authorize transactions.
                </p>
              </div>

              <div className="space-y-5">
                <h4 className="text-base font-semibold text-foreground">
                  What your wallet enables:
                </h4>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">
                        Asset Control
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        View, manage, and interact with tokenized assets on the
                        Asset Tokenization Kit platform. Your wallet gives you
                        complete control over your digital assets.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">
                        Transaction Authorization
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Securely authorize every transaction - from trading
                        tokens to registering your ONCHAINID - with your digital
                        signature.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">
                        Identity Management
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your wallet forms the foundation for your unique
                        ONCHAINID, linking your verified identity to all
                        blockchain activities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <Button
          onClick={() => {
            createWallet({});
          }}
        >
          Create my wallet
        </Button>
      </footer>
    </div>
  );
}
