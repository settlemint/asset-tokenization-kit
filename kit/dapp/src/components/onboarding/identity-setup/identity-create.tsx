import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { InfoAlert } from "@/components/ui/info-alert";
import { WarningAlert } from "@/components/ui/warning-alert";
import { VerificationButton } from "@/components/verification-dialog/verification-button";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function IdentityCreate() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { refreshUserState } = useOnboardingNavigation();
  const queryClient = useQueryClient();

  const { mutateAsync: createIdentity, isPending: isIdentityCreating } =
    useMutation(
      orpc.system.identity.create.mutationOptions({
        onSuccess: async () => {
          // Refetch all relevant data
          await queryClient.invalidateQueries({
            queryKey: orpc.account.me.queryOptions().queryKey,
            refetchType: "all",
          });
          await refreshUserState();
        },
      })
    );

  const handleSubmit = useCallback(
    (verification: UserVerification) => {
      toast.promise(
        createIdentity({
          walletVerification: verification,
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
    <FormStepLayout
      title={t("identity-setup.title")}
      description={t("identity-setup.description")}
      fullWidth={true}
      actions={
        <VerificationButton
          walletVerification={{
            title: t("identity-setup.confirm-title"),
            description: t("identity-setup.confirm-description"),
          }}
          onSubmit={handleSubmit}
          disabled={isIdentityCreating}
        >
          {isIdentityCreating
            ? t("identity-setup.form.submitting")
            : t("identity-setup.form.submit")}
        </VerificationButton>
      }
    >
      <div className="space-y-6">
        <WarningAlert description={t("identity-setup.deployment-warning")} />

        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("identity-setup.body-1")}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("identity-setup.body-2")}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("identity-setup.body-3")}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("identity-setup.body-4")}
          </p>
        </div>

        <InfoAlert
          description={t("identity-setup.transaction-confirmation-info")}
        />
      </div>
    </FormStepLayout>
  );
}
