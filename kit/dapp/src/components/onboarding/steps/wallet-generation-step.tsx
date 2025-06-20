import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { orpc } from "@/orpc";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function WalletGenerationStep() {
  const { data: user } = useQuery(orpc.user.me.queryOptions());
  const { sessionKey } = useContext(AuthQueryContext);
  const { t } = useTranslation(["onboarding", "general"]);

  const { mutate: generateWallet } = useMutation(
    orpc.account.create.mutationOptions({
      onSuccess: async () => {
        toast.success(t("onboarding:wallet-generated"));
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
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  return (
    <Button
      disabled={!!user?.wallet || !user?.id}
      onClick={() => {
        if (user?.id) {
          generateWallet({
            userId: user.id,
            messages: {
              walletCreated: t("onboarding:wallet-generated"),
              walletAlreadyExists: t("onboarding:wallet-already-exists"),
              walletCreationFailed: t("onboarding:wallet-creation-failed"),
            },
          });
        }
      }}
    >
      Generate a new wallet
    </Button>
  );
}
