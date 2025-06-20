import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import { WalletStep } from "@/components/onboarding/steps/wallet-step";
import { SystemStep } from "@/components/onboarding/steps/system-step";
import { AssetSelectionStep } from "@/components/onboarding/steps/asset-selection-step";

export const Route = createFileRoute("/_private/onboarding/platform")({
  component: PlatformOnboarding,
});

function PlatformOnboarding() {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const [currentStepId, setCurrentStepId] = useState("wallet");

  // Query user and system data to determine step statuses
  const { data: user } = useQuery(orpc.user.me.queryOptions());
  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress?.value ?? "" },
    }),
    enabled: !!systemAddress?.value,
  });

  // Define steps with dynamic statuses
  const steps: Step[] = [
    {
      id: "wallet",
      title: t("steps.wallet.title"),
      description: t("steps.wallet.description"),
      status: user?.wallet
        ? "completed"
        : currentStepId === "wallet"
          ? "active"
          : "pending",
    },
    {
      id: "system",
      title: t("steps.system.title"),
      description: t("steps.system.description"),
      status: systemAddress?.value
        ? "completed"
        : currentStepId === "system"
          ? "active"
          : "pending",
    },
    {
      id: "assets",
      title: t("steps.assets.title"),
      description: t("steps.assets.description"),
      status:
        (systemDetails?.tokenFactories.length ?? 0) > 0
          ? "completed"
          : currentStepId === "assets"
            ? "active"
            : "pending",
    },
  ];

  const handleStepChange = (stepId: string) => {
    setCurrentStepId(stepId);
  };

  const handleWalletSuccess = () => {
    setCurrentStepId("system");
  };

  const handleSystemSuccess = () => {
    setCurrentStepId("assets");
  };

  const handleAssetsSuccess = () => {
    // Platform onboarding complete, redirect to dashboard
    void navigate({ to: "/" });
  };

  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={["platform"]}>
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <StepWizard
            steps={steps}
            currentStepId={currentStepId}
            title={t("platform.title")}
            description={t("platform.description")}
            onStepChange={handleStepChange}
          >
            {currentStepId === "wallet" && (
              <WalletStep onSuccess={handleWalletSuccess} />
            )}
            {currentStepId === "system" && (
              <SystemStep onSuccess={handleSystemSuccess} />
            )}
            {currentStepId === "assets" && (
              <AssetSelectionStep onSuccess={handleAssetsSuccess} />
            )}
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
