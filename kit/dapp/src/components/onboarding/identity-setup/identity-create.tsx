import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

export function IdentityCreate() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { refreshUserState } = useOnboardingNavigation();
  const queryClient = useQueryClient();

  // Verification dialog state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  const { mutateAsync: createIdentity, isPending: isIdentityCreating } =
    useMutation(
      orpc.system.identityCreate.mutationOptions({
        onSuccess: async (result) => {
          for await (const event of result) {
            logger.info("identity creation event", event);
            if (event.status === "failed") {
              throw new Error(event.message);
            }
          }
          // Refetch all relevant data
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: orpc.account.me.queryOptions().queryKey,
              refetchType: "all",
            }),
          ]);
          await refreshUserState();
        },
      })
    );

  // Handle verification code submission
  const handleVerificationSubmit = useCallback(
    (verification: UserVerification) => {
      setVerificationError(null);
      setShowVerificationModal(false);

      toast.promise(
        createIdentity({
          verification,
        }),
        {
          loading: t("identity-setup.deploying-toast"),
          success: t("identity-setup.deployed-toast"),
          error: (error: Error) =>
            `${t("identity-setup.failed-toast")}${error.message}`,
        }
      );
    },
    [createIdentity, t]
  );

  return (
    <OnboardingStepLayout
      title={t("identity-setup.title")}
      description={t("identity-setup.description")}
      actions={
        <Button
          onClick={() => { setShowVerificationModal(true); }}
          disabled={isIdentityCreating}
        >
          {isIdentityCreating
            ? t("identity-setup.form.submitting")
            : t("identity-setup.form.submit")}
        </Button>
      }
    >
      <InfoAlert title={t("identity-setup.info")} />

      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={handleVerificationSubmit}
        title={t("identity-setup.confirm-title")}
        description={t("identity-setup.confirm-description")}
        errorMessage={verificationError}
      />
    </OnboardingStepLayout>
  );
}
