import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { orpc } from "@/orpc/orpc-client";
import { useMutation } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function SystemDeploy() {
  const { t } = useTranslation(["onboarding"]);
  const { refreshUserState, completeStepAndNavigate } =
    useOnboardingNavigation();

  // Modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // System deployment mutation
  const { mutateAsync: createSystem, isPending: isCreatingSystem } =
    useMutation(
      orpc.system.create.mutationOptions({
        onSuccess: async () => {
          await refreshUserState();
          await completeStepAndNavigate(OnboardingStep.systemDeploy);
        },
      })
    );

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {t("system.initialize-title")}
          </h2>
          <p className="text-sm text-muted-foreground pt-2">
            {t("system.initialize-subtitle")}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl space-y-6">
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t("system.what-gets-deployed")}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t("system.core-system-contract")}</li>
                <li>{t("system.identity-registry")}</li>
                <li>{t("system.compliance-engine")}</li>
                <li>{t("system.trusted-issuers")}</li>
                <li>{t("system.token-factory")}</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowVerificationModal(true);
                }}
                disabled={isCreatingSystem}
                className="flex-1"
              >
                {isCreatingSystem ? t("system.deploying") : t("system.deploy")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={({ pincode, otp }) => {
          // Determine which verification method was provided
          let verificationCode: string;
          let verificationType: "pincode" | "two-factor";

          if (pincode !== undefined) {
            verificationCode = pincode;
            verificationType = "pincode";
          } else if (otp !== undefined) {
            verificationCode = otp;
            verificationType = "two-factor";
          } else {
            throw new Error("No verification code provided");
          }

          if (!verificationCode) {
            throw new Error("Verification code cannot be empty");
          }

          toast.promise(
            createSystem({
              verification: {
                verificationCode,
                verificationType,
              },
            }),
            {
              loading: t("system.deploying-toast"),
              success: t("system.deployed-toast"),
              error: (error: Error) =>
                `${t("system.failed-toast")}${error.message}`,
            }
          );
        }}
        title={t("system.confirm-deployment-title")}
        description={t("system.confirm-deployment-description")}
      />
    </>
  );
}
