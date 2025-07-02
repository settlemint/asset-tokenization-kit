import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import { authClient } from "@/lib/auth/auth.client";
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
  const [currentStepId] = useState("security");
  const { data: session } = authClient.useSession();

  // Define steps with dynamic statuses
  const steps: Step[] = useMemo(
    () => [
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

  const handleSecuritySuccess = useCallback(() => {
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
            {currentStepId === "security" && (
              <WalletSecurityStep onSuccess={handleSecuritySuccess} />
            )}
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
