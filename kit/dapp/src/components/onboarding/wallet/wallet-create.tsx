import { BulletPoint } from "@/components/onboarding/bullet-point";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function CreateWallet() {
  const { t } = useTranslation(["onboarding"]);
  const { refreshUserState } = useOnboardingNavigation();

  const { mutateAsync: createWallet, isPending: isWalletCreating } =
    useMutation(
      orpc.user.createWallet.mutationOptions({
        onSuccess: async () => {
          await refreshUserState();
        },
      })
    );

  return (
    <OnboardingStepLayout
      title={t("steps.wallet.title")}
      description={t("wallet.subtitle")}
      actions={
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
          {isWalletCreating ? t("wallet.creating-wallet") : t("wallet.submit")}
        </Button>
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
            <h4 className="text-base font-semibold text-foreground">
              {t("wallet.what-your-wallet-enables")}
            </h4>

            <div className="space-y-4">
              <BulletPoint>
                <div>
                  <h5 className="font-medium text-foreground mb-1">
                    {t("wallet.asset-control")}
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("wallet.asset-control-description")}
                  </p>
                </div>
              </BulletPoint>

              <BulletPoint>
                <div>
                  <h5 className="font-medium text-foreground mb-1">
                    {t("wallet.invest-in-digital-assets")}
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("wallet.invest-in-digital-assets-description")}
                  </p>
                </div>
              </BulletPoint>

              <BulletPoint>
                <div>
                  <h5 className="font-medium text-foreground mb-1">
                    {t("wallet.manage-your-digital-assets")}
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("wallet.manage-your-digital-assets-description")}
                  </p>
                </div>
              </BulletPoint>
            </div>
          </div>
        </div>
      </div>
    </OnboardingStepLayout>
  );
}
