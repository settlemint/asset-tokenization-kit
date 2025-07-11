import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";
import { WalletStep } from "@/components/onboarding/steps/wallet-step";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import { authClient } from "@/lib/auth/auth.client";
import type { OnboardingType } from "@/lib/types/onboarding";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/issuer")({
  loader: async ({ context: { queryClient, orpc } }) => {
    // User data is critical for determining step status
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
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
  const [currentStepId, setCurrentStepId] = useState("wallet");
  const { data: session } = authClient.useSession();

  // Define steps with dynamic statuses
  const steps: Step[] = useMemo(
    () => [
      {
        id: "wallet",
        title: t("steps.wallet.title"),
        description: t("steps.wallet.description"),
        status: currentStepId === "wallet" ? "active" : "completed",
      },
      {
        id: "security",
        title: t("steps.security.title"),
        description: t("steps.security.description"),
        status: session?.user.pincodeEnabled
          ? "completed"
          : currentStepId === "security"
            ? "active"
            : "pending",
      },
    ],
    [currentStepId, session?.user.pincodeEnabled, t]
  );

  const handleWalletSuccess = useCallback(() => {
    setCurrentStepId("security");
  }, []);

  const handleSecuritySuccess = useCallback(() => {
    // Issuer onboarding complete, redirect to dashboard
    void navigate({ to: "/" });
  }, [navigate]);

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
            onStepChange={setCurrentStepId}
          >
            {currentStepId === "wallet" && (
              <WalletStep onSuccess={handleWalletSuccess} />
            )}
            {currentStepId === "security" && (
              <WalletSecurityStep
                onNext={handleSecuritySuccess}
                onPrevious={handleWalletSuccess}
                isFirstStep={false}
                isLastStep={true}
              />
            )}
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
