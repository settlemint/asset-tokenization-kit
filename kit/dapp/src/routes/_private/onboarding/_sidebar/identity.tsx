import { KycForm, KycFormValues } from "@/components/kyc/kyc-form";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { InfoAlert } from "@/components/ui/info-alert";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

export const Route = createFileRoute("/_private/onboarding/_sidebar/identity")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.identity),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { refreshUserState } = useOnboardingNavigation();
  const { data: session } = authClient.useSession();

  // Verification dialog state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [kycFormValues, setKycFormValues] = useState<KycFormValues | null>(
    null
  );

  const { mutateAsync: registerIdentity, isPending: isRegisteringIdentity } =
    useMutation(
      orpc.system.identityRegister.mutationOptions({
        onSuccess: async (result) => {
          for await (const event of result) {
            logger.info("identity registration event", event);
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
        },
      })
    );

  const { mutateAsync: updateKyc, isPending: isUpdatingKyc } = useMutation(
    orpc.user.kyc.upsert.mutationOptions({
      onSuccess: async () => {
        await refreshUserState();
        //  Navigate to home page (onboarding complete)
        void navigate({ to: "/" });
      },
    })
  );

  const handleComplete = useCallback(async (values: KycFormValues) => {
    setShowVerificationModal(true);
    setKycFormValues(values);
  }, []);

  const handleVerificationSubmit = useCallback(
    (verification: UserVerification) => {
      setVerificationError(null);
      setShowVerificationModal(false);

      toast.promise(
        registerIdentity({
          country: kycFormValues?.country ?? "",
          verification,
        }).then(() => {
          if (!kycFormValues) {
            throw new Error("KYC form values are not set");
          }
          const { country, ...input } = kycFormValues;
          return updateKyc({
            ...input,
            userId: session?.user.id ?? "",
          });
        }),
        {
          loading: t("identity.deploying-toast"),
          success: t("identity.deployed-toast"),
          error: (error: Error) =>
            `${t("identity.failed-toast")}${error.message}`,
        }
      );
    },
    [kycFormValues]
  );

  return (
    <OnboardingStepLayout
      title={t("identity.title")}
      description={t("identity.description")}
    >
      <InfoAlert title={t("identity.intro")} />
      <KycForm
        onComplete={handleComplete}
        disabled={isRegisteringIdentity || isUpdatingKyc}
      />
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={handleVerificationSubmit}
        title={t("identity.confirm-title")}
        description={t("identity.confirm-description")}
        errorMessage={verificationError}
      />
    </OnboardingStepLayout>
  );
}
