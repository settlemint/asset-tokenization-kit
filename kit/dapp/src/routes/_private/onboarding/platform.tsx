import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { AssetSelectionStep } from "@/components/onboarding/steps/asset-selection-step";
import { SystemStep } from "@/components/onboarding/steps/system-step";
import { WalletStep } from "@/components/onboarding/steps/wallet-step";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { orpc } from "@/orpc";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/platform")({
  loader: async ({ context }) => {
    // Load user and system address in parallel
    const [user, systemAddress] = await Promise.all([
      context.queryClient.ensureQueryData(orpc.user.me.queryOptions()),
      context.queryClient.ensureQueryData(
        orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
      ),
    ]);

    // If we have a system address, ensure system details are loaded
    let systemDetails = null;
    if (systemAddress) {
      systemDetails = await context.queryClient.ensureQueryData(
        orpc.system.read.queryOptions({
          input: { id: systemAddress },
        })
      );
    }

    return { user, systemAddress, systemDetails };
  },
  component: PlatformOnboarding,
});

function PlatformOnboarding() {
  const { t } = useTranslation(["general", "onboarding"]);
  const navigate = useNavigate();

  // Get data from loader
  const { user, systemAddress, systemDetails } = Route.useLoaderData();

  // Determine initial step based on what's completed
  const getInitialStep = () => {
    if (!user.wallet) return "wallet";
    if (!systemAddress) return "system";
    if ((systemDetails?.tokenFactories.length ?? 0) === 0) return "assets";
    return "assets"; // Default to last step if all complete
  };

  // Initialize with the correct step based on loader data
  const [currentStepId, setCurrentStepId] = useState(getInitialStep);

  // Define steps with dynamic statuses
  const steps: Step[] = [
    {
      id: "wallet",
      title: "Generate Wallet",
      description: "Create your secure blockchain wallet",
      status: user.wallet
        ? "completed"
        : currentStepId === "wallet"
          ? "active"
          : "pending",
    },
    {
      id: "system",
      title: "Deploy System",
      description: "Deploy your SMART tokenization system",
      status: systemAddress
        ? "completed"
        : currentStepId === "system"
          ? "active"
          : "pending",
    },
    {
      id: "assets",
      title: t("onboarding:steps.assets.title"),
      description: t("onboarding:steps.assets.description"),
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
    // Don't auto-advance
  };

  const handleSystemSuccess = () => {
    // Don't auto-advance
  };

  const handleAssetsSuccess = () => {
    // Don't navigate away immediately - let the user see the success state
    // They can click "Complete" to finish
  };

  // Navigation handlers
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  // Store references to step action functions
  const walletActionRef = useRef<(() => void) | null>(null);
  const systemActionRef = useRef<(() => void) | null>(null);
  const assetsActionRef = useRef<(() => void) | null>(null);

  const handleNext = () => {
    // Check if current step needs special action
    if (currentStepId === "wallet" && !user.wallet && walletActionRef.current) {
      walletActionRef.current();
      return;
    }

    if (
      currentStepId === "system" &&
      !systemAddress &&
      systemActionRef.current
    ) {
      systemActionRef.current();
      return;
    }

    if (
      currentStepId === "assets" &&
      (systemDetails?.tokenFactories.length ?? 0) === 0 &&
      assetsActionRef.current
    ) {
      assetsActionRef.current();
      return;
    }

    // Normal navigation - move to next step
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStepId(nextStep.id);
      }
    } else if (currentStepIndex === steps.length - 1) {
      // Last step - complete onboarding
      if ((systemDetails?.tokenFactories.length ?? 0) > 0) {
        // All done - navigate to dashboard
        void navigate({ to: "/" });
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStepId(prevStep.id);
      }
    }
  };

  // Determine if next button should be disabled
  const isNextDisabled = () => {
    // For wallet step, enable button if no wallet
    if (currentStepId === "wallet" && !user.wallet) {
      return false; // Enable the "Generate Wallet" button
    }

    // For system step, enable button if no system
    if (currentStepId === "system" && !systemAddress) {
      return false; // Enable the "Deploy System" button
    }

    // For assets step, enable button if no assets deployed
    if (
      currentStepId === "assets" &&
      (systemDetails?.tokenFactories.length ?? 0) === 0
    ) {
      return false; // Enable the "Deploy Asset Factories" button
    }

    const currentStep = steps[currentStepIndex];
    return currentStep?.status !== "completed";
  };

  // Determine button labels
  const getNextLabel = () => {
    if (currentStepId === "wallet" && !user.wallet) {
      return "Generate Wallet";
    }
    if (currentStepId === "system" && !systemAddress) {
      return "Deploy System";
    }
    if (
      currentStepId === "assets" &&
      (systemDetails?.tokenFactories.length ?? 0) === 0
    ) {
      return "Deploy Asset Factories";
    }
    if (currentStepIndex === steps.length - 1) {
      return t("onboarding:complete", "Complete");
    }
    return t("onboarding:next", "Next");
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
              title="Let's get you set up!"
              description="You will need a wallet and an identity on the blockchain to use this platform."
              onStepChange={handleStepChange}
              showBackButton={currentStepIndex > 0}
              showNextButton={true}
              onBack={handleBack}
              onNext={handleNext}
              isBackDisabled={false}
              isNextDisabled={isNextDisabled()}
              nextLabel={getNextLabel()}
              backLabel={t("onboarding:back", "Back")}
            >
              {currentStepId === "wallet" && (
                <WalletStep
                  onSuccess={handleWalletSuccess}
                  onRegisterAction={(action) => {
                    walletActionRef.current = action;
                  }}
                />
              )}
              {currentStepId === "system" && (
                <SystemStep
                  onSuccess={handleSystemSuccess}
                  onRegisterAction={(action) => {
                    systemActionRef.current = action;
                  }}
                />
              )}
              {currentStepId === "assets" && (
                <AssetSelectionStep
                  onSuccess={handleAssetsSuccess}
                  onRegisterAction={(action) => {
                    assetsActionRef.current = action;
                  }}
                />
              )}
            </StepWizard>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}
