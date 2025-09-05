import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { BulletPoint } from "@/components/onboarding/bullet-point";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function CreateWallet() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { refreshUserState } = useOnboardingNavigation();
  const navigate = useNavigate();

  const { mutateAsync: createWallet, isPending: isWalletCreating } =
    useMutation(
      orpc.user.createWallet.mutationOptions({
        onSuccess: async () => {
          await refreshUserState();
        },
      })
    );

  return (
    <FormStepLayout
      title={t("steps.wallet.title")}
      description={t("wallet.subtitle")}
      fullWidth={true}
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => {
              void navigate({ to: "/onboarding" });
            }}
            disabled={isWalletCreating}
          >
            {t("general:cancel")}
          </Button>
          <Button
            onClick={() => {
              toast.promise(createWallet({}), {
                loading: t("wallet.creating-wallet"),
                success: t("wallet.wallet-created-successfully"),
                error: (error: Error) =>
                  t("wallet.failed-to-create-wallet", {
                    error: error.message,
                  }),
              });
            }}
            disabled={isWalletCreating}
          >
            {isWalletCreating
              ? t("wallet.creating-wallet")
              : t("wallet.submit")}
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-base text-foreground leading-relaxed">
              {t("wallet.intro")}
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-foreground">
                {t("wallet.how-it-works")}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("wallet.how-it-works-description")}
              </p>
            </div>

            <div className="space-y-4">
              <BulletPoint>
                <div>
                  <h5 className="font-medium text-foreground mb-1">
                    {t("wallet.access-your-assets")}
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("wallet.access-your-assets-description")}
                  </p>
                </div>
              </BulletPoint>

              <BulletPoint>
                <div>
                  <h5 className="font-medium text-foreground mb-1">
                    {t("wallet.authorize-transactions")}
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("wallet.authorize-transactions-description")}
                  </p>
                </div>
              </BulletPoint>

              <BulletPoint>
                <div>
                  <h5 className="font-medium text-foreground mb-1">
                    {t("wallet.manage-on-chain-identity")}
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("wallet.manage-on-chain-identity-description")}
                  </p>
                </div>
              </BulletPoint>
            </div>
          </div>
        </div>
      </div>
    </FormStepLayout>
  );
}
