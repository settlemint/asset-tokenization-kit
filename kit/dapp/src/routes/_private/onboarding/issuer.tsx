import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { WalletStep } from "@/components/onboarding/steps/wallet-step";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import type { OnboardingType } from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/issuer")({
  loader: async ({ context }) => {
    // User data is critical for determining step status
    const user = await context.queryClient.ensureQueryData(
      orpc.user.me.queryOptions()
    );
    return { user };
  },
  component: IssuerOnboarding,
});

/**
 *
 */
function IssuerOnboarding() {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const [currentStepId] = useState("wallet");

  // Get user data from loader
  const { user } = Route.useLoaderData();

  // Define steps with dynamic statuses
  const steps: Step[] = useMemo(
    () => [
      {
        id: "wallet",
        title: t("steps.wallet.title"),
        description: t("steps.wallet.description"),
        status: user.wallet ? "completed" : "active",
      },
    ],
    [user.wallet, t]
  );

  const handleWalletSuccess = useCallback(() => {
    // Issuer onboarding complete, redirect to dashboard
    void navigate({ to: "/" });
  }, [navigate]);

  const handleStepChange = useCallback(() => {
    // Only one step for issuer onboarding
  }, []);

  const allowedTypes: OnboardingType[] = useMemo(() => ["issuer"], []);

  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <StepWizard
            steps={steps}
            currentStepId={currentStepId}
            title={t("issuer.title")}
            description={t("issuer.description")}
            onStepChange={handleStepChange}
          >
            <WalletStep onSuccess={handleWalletSuccess} />
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
