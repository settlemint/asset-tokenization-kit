import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { BulletPoint } from "@/components/onboarding/bullet-point";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { VerificationButton } from "@/components/verification-dialog/verification-button";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useMutation } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function SystemDeploy() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { refreshUserState } = useOnboardingNavigation();
  // System deployment mutation
  const { mutateAsync: createSystem, isPending: isCreatingSystem } =
    useMutation(
      orpc.system.create.mutationOptions({
        onSuccess: async () => {
          await refreshUserState();
        },
      })
    );

  const handleSubmit = useCallback(
    (verification: UserVerification) => {
      toast.promise(
        createSystem({
          walletVerification: verification,
        }),
        {
          loading: t("system.deploying-toast"),
          success: t("system.deployed-toast"),
          error: (error: Error) =>
            `${t("system.failed-toast")}${error.message}`,
        }
      );
    },
    [createSystem, t]
  );

  return (
    <FormStepLayout
      title={t("system.initialize-title")}
      description={t("system.initialize-subtitle")}
      fullWidth={true}
      actions={
        <VerificationButton
          walletVerification={{
            title: t("system.confirm-deployment-title"),
            description: t("system.confirm-deployment-description"),
          }}
          onSubmit={handleSubmit}
          disabled={isCreatingSystem}
        >
          {isCreatingSystem ? t("system.deploying") : t("system.deploy")}
        </VerificationButton>
      }
    >
      <>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            <div className="rounded-lg bg-sm-state-warning-background/50 border border-sm-state-warning-background p-4">
              <div className="flex items-start gap-3">
                <TriangleAlert className="h-5 w-5 text-sm-state-warning mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-sm-state-warning">
                    {t("system.deployment-warning")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <p>{t("system.bootstrap-explanation")}</p>
              <p>{t("system.admin-role-explanation")}</p>
              <div>
                <p className="font-medium mb-3">
                  {t("system.bootstrap-contracts-header")}
                </p>
                <div className="space-y-4">
                  <BulletPoint>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">
                        {t("system.identity-registry-name")}
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("system.identity-registry-description")}
                      </p>
                    </div>
                  </BulletPoint>
                  <BulletPoint>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">
                        {t("system.compliance-engine-name")}
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("system.compliance-engine-description")}
                      </p>
                    </div>
                  </BulletPoint>
                  <BulletPoint>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">
                        {t("system.trusted-issuers-name")}
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("system.trusted-issuers-description")}
                      </p>
                    </div>
                  </BulletPoint>
                </div>
              </div>
              <p>{t("system.infrastructure-conclusion")}</p>
            </div>
          </div>
        </div>
      </>
    </FormStepLayout>
  );
}
