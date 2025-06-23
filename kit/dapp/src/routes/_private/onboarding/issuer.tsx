import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import { WalletStep } from "@/components/onboarding/steps/wallet-step";

export const Route = createFileRoute("/_private/onboarding/issuer")({
  component: IssuerOnboarding,
});

function IssuerOnboarding() {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const [currentStepId] = useState("wallet");

  // Query user data to determine step status
  const { data: user } = useQuery(orpc.user.me.queryOptions());

  // Define steps with dynamic statuses
  const steps: Step[] = [
    {
      id: "wallet",
      title: t("steps.wallet.title"),
      description: t("steps.wallet.description"),
      status: user?.wallet ? "completed" : "active",
    },
  ];

  const handleWalletSuccess = () => {
    // Issuer onboarding complete, redirect to dashboard
    void navigate({ to: "/" });
  };

  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={["issuer"]}>
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <StepWizard
            steps={steps}
            currentStepId={currentStepId}
            title={t("issuer.title")}
            description={t("issuer.description")}
            onStepChange={() => {
              // Only one step for issuer onboarding
            }}
          >
            <WalletStep onSuccess={handleWalletSuccess} />
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
