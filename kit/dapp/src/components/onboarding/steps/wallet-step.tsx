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
import { orpc } from "@/orpc";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface WalletStepProps {
  onSuccess?: () => void;
}

export function WalletStep({ onSuccess }: WalletStepProps) {
  const { data: user } = useQuery(orpc.user.me.queryOptions());
  const { sessionKey } = useContext(AuthQueryContext);
  const { t } = useTranslation(["onboarding", "general"]);

  const { mutate: generateWallet, isPending } = useMutation(
    orpc.account.create.mutationOptions({
      onSuccess: async () => {
        toast.success(t("wallet.generated"));
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
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const hasWallet = !!user?.wallet;

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sm-graphics-primary/20">
          <Wallet className="h-6 w-6 text-sm-graphics-primary" />
        </div>
        <CardTitle>{t("wallet.title")}</CardTitle>
        <CardDescription>{t("wallet.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">{t("wallet.info")}</p>
        </div>

        <Button
          disabled={hasWallet || !user?.id || isPending}
          onClick={() => {
            if (user?.id) {
              generateWallet({
                userId: user.id,
                messages: {
                  walletCreated: t("wallet.generated"),
                  walletAlreadyExists: t("wallet.already-exists"),
                  walletCreationFailed: t("wallet.creation-failed"),
                },
              });
            }
          }}
          className="w-full"
        >
          {isPending ? t("general:generating") : t("wallet.generate")}
        </Button>

        {hasWallet && (
          <div className="rounded-lg border-l-4 border-sm-state-success bg-sm-state-success-background/20 p-4">
            <p className="text-sm font-medium text-sm-state-success-fg-deep dark:text-sm-state-success">
              {t("wallet.success")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{user.wallet}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
