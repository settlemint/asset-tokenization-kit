import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface WalletStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orpc: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  onComplete: () => void;
}

export function WalletStep({ orpc, user, onComplete }: WalletStepProps) {
  const { t } = useTranslation(["onboarding", "general"]);
  const { sessionKey } = useContext(AuthQueryContext);

  const { mutate: generateWallet, isPending } = useMutation(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    orpc.account.create.mutationOptions({
      onSuccess: async () => {
        toast.success(
          t(
            "onboarding:wallet-generated-success",
            "Wallet generated successfully!"
          )
        );
        await authClient.getSession({
          query: {
            disableCookieCache: true,
          },
        });
        void queryClient.invalidateQueries({
          queryKey: sessionKey,
        });
        void queryClient.invalidateQueries({
          queryKey: orpc.user.me.key(),
        });
        onComplete();
      },
      onError: (error: Error) => {
        toast.error(
          t("onboarding:wallet-generated-error", "Failed to generate wallet")
        );
        console.error("Wallet generation failed:", error);
      },
    })
  );

  const hasWallet = !!user?.wallet;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          {t("onboarding:wallet-step-title", "Generate Your Wallet")}
        </CardTitle>
        <CardDescription>
          {t(
            "onboarding:wallet-step-description",
            "Create a secure blockchain wallet to interact with the platform"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">
            {t("onboarding:what-is-wallet", "What is a wallet?")}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t(
              "onboarding:wallet-explanation",
              "A blockchain wallet is your digital identity that allows you to interact with smart contracts and manage digital assets securely."
            )}
          </p>
        </div>

        {hasWallet ? (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600 dark:text-green-400"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {t("onboarding:wallet-already-exists", "Wallet already exists")}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {t(
                  "onboarding:wallet-ready-next-step",
                  "You're ready to proceed to the next step"
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t(
                      "onboarding:secure-wallet-generation",
                      "Secure wallet generation"
                    )}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {t(
                      "onboarding:wallet-generation-time",
                      "This process takes a few seconds"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                if (user) {
                  generateWallet();
                }
              }}
              disabled={!user || isPending}
              size="lg"
              className="w-full"
            >
              {isPending
                ? t("onboarding:generating-wallet", "Generating wallet...")
                : t("onboarding:generate-new-wallet", "Generate new wallet")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
