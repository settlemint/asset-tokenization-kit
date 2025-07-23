import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { useAppForm } from "@/hooks/use-app-form";
import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import { orpc } from "@/orpc/orpc-client";
import { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

const identitySetupFormSchema = z.object({
  country: isoCountryCode,
});

const logger = createLogger();

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/identity-setup"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.identitySetup),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { refreshUserState } = useOnboardingNavigation();
  const queryClient = useQueryClient();

  const { data: account } = useSuspenseQuery({
    ...orpc.account.me.queryOptions(),
  });
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: "default" },
    }),
  });

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

  const form = useAppForm({
    defaultValues: {
      country: account?.country ?? ".",
    },
    validators: {
      onSubmit: identitySetupFormSchema,
    },
    onSubmit: () => {
      setShowVerificationModal(true);
    },
  });

  // Handle verification code submission
  const handleVerificationSubmit = useCallback(
    (verification: UserVerification) => {
      if (!systemDetails?.identityRegistry) {
        return;
      }

      setVerificationError(null);
      setShowVerificationModal(false);

      toast.promise(
        createIdentity({
          verification,
          country: form.state.values.country,
        }),
        {
          loading: t("identity-setup.deploying-toast"),
          success: t("identity-setup.deployed-toast"),
          error: (error: Error) =>
            `${t("identity-setup.failed-toast")}${error.message}`,
        }
      );
    },
    [createIdentity, t, systemDetails?.identityRegistry]
  );

  return (
    <OnboardingStepLayout
      title={t("steps.identity-setup.title")}
      description={t("steps.identity-setup.description")}
    >
      <InfoAlert title={t("identity-setup.info")} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        <form.AppForm>
          <form.AppField
            name="country"
            children={(field) => (
              <field.CountrySelectField
                label={t("identity-setup.form.country")}
                required={true}
                disabled={isIdentityCreating}
              />
            )}
          />
          <Button type="submit" disabled={isIdentityCreating}>
            {isIdentityCreating
              ? t("identity-setup.form.submitting")
              : t("identity-setup.form.submit")}
          </Button>
        </form.AppForm>
      </form>
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
