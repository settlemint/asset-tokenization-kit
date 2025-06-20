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
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
      <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
        {/* Logo positioned in top-left - matching auth pages */}
        <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
          <div className="flex w-full items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Logo variant="icon" forcedColorMode="dark" />
            </div>
            <div className="flex flex-col text-foreground leading-none">
              <span className="font-bold text-lg text-primary-foreground">
                SettleMint
              </span>
              <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md text-sm leading-snug text-primary-foreground dark:text-foreground">
                {t("general:appDescription")}
              </span>
            </div>
          </div>
        </div>
        {/* Language and theme toggles positioned in top-right - matching auth pages */}
        <div className="absolute top-8 right-8 flex gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        {/* Centered content area with step wizard */}
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-6xl px-4">
            <StepWizard
              steps={steps}
              currentStepId={currentStepId}
              title={t("platform.title")}
              description={t("platform.description")}
              onStepChange={handleStepChange}
              showBackButton={false}
              showNextButton={false}
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
      </div>
    </OnboardingGuard>
  );
}
