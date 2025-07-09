import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { AssetSelectionStep } from "@/components/onboarding/steps/asset-selection-step";
import { SystemStep } from "@/components/onboarding/steps/system-step";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";
import { WalletStep } from "@/components/onboarding/steps/wallet-step";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSettings } from "@/hooks/use-settings";
import { authClient } from "@/lib/auth/auth.client";
import type { OnboardingType } from "@/lib/types/onboarding";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/platform")({
  loader: async ({ context: { queryClient, orpc } }) => {
    // Load user and system address in parallel
    const [user, systemAddress] = await Promise.all([
      queryClient.ensureQueryData(orpc.user.me.queryOptions()),
      queryClient.ensureQueryData(
        orpc.settings.read.queryOptions({
          input: { key: "SYSTEM_ADDRESS" },
        })
      ),
    ]);

    // If we have a system address, ensure system details are loaded
    let systemDetails = null;
    if (systemAddress) {
      systemDetails = await queryClient.ensureQueryData(
        orpc.system.read.queryOptions({
          input: { id: systemAddress },
        })
      );
    }

    return { user, systemAddress, systemDetails };
  },
  component: PlatformOnboarding,
});

/**
 *
 */
function PlatformOnboarding() {
  const { t } = useTranslation(["general", "onboarding"]);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // Get data from loader
  const {
    user: preloadedUser,
    systemAddress: loaderSystemAddress,
    systemDetails,
  } = Route.useLoaderData();

  // Get user from session or loader data
  const user = session?.user ?? preloadedUser;

  // Get real-time system address from settings hook
  const [liveSystemAddress] = useSettings("SYSTEM_ADDRESS");

  // Use live system address if available, otherwise fall back to loader data
  const systemAddress = liveSystemAddress ?? loaderSystemAddress;

  // Start with first step, will update when data loads
  const [currentStepId, setCurrentStepId] = useState("wallet");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isExplicitSecurityNavigation, setIsExplicitSecurityNavigation] =
    useState(false);

  // Determine initial step based on what's completed
  const getInitialStep = useCallback(() => {
    if (!session?.user.pincodeEnabled) return "wallet";
    if (!systemAddress) return "system";
    if ((systemDetails?.tokenFactories.length ?? 0) === 0) return "assets";
    return "assets"; // Default to last step if all complete
  }, [session?.user, systemAddress, systemDetails?.tokenFactories.length]);

  // Set initial step once when data is loaded
  useEffect(() => {
    // Only set initial step once when we have all necessary data
    if (!hasInitialized && session?.user) {
      const initialStep = getInitialStep();
      setCurrentStepId(initialStep);
      setHasInitialized(true);
    }
  }, [user, session?.user, hasInitialized, getInitialStep]);

  // Note: Auto-navigation after system deployment is now handled in the SystemStep's onSuccess callback

  // Define steps with dynamic statuses
  const steps: Step[] = useMemo(
    () => [
      {
        id: "wallet",
        title: t("onboarding:steps.wallet.title"),
        description: t("onboarding:steps.wallet.description"),
        status: currentStepId === "wallet" ? "active" : "completed",
      },
      {
        id: "security",
        title: t("onboarding:steps.security.title"),
        description: t("onboarding:steps.security.description"),
        status: session?.user.pincodeEnabled
          ? "completed"
          : currentStepId === "security"
            ? "active"
            : "pending",
      },
      {
        id: "system",
        title: t("onboarding:steps.system.title"),
        description: t("onboarding:steps.system.description"),
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
    ],
    [
      currentStepId,
      session?.user.pincodeEnabled,
      systemAddress,
      systemDetails?.tokenFactories.length,
      t,
    ]
  );

  const handleStepChange = useCallback((stepId: string) => {
    setCurrentStepId(stepId);
  }, []);

  const handleWalletSuccess = useCallback(() => {
    // Auto-advance to security step after wallet generation (normal flow)
    setIsExplicitSecurityNavigation(false); // This is automatic navigation, not explicit
    setCurrentStepId("security");
  }, []);

  const handleSecuritySuccess = useCallback(() => {
    // Reset the explicit navigation flag
    setIsExplicitSecurityNavigation(false);
    // Auto-advance to system step after PIN setup
    setCurrentStepId("system");
  }, []);

  const handleSystemSuccess = useCallback(() => {
    // Auto-advance to next step after successful system deployment
    setCurrentStepId("assets");
  }, []);

  const handleAssetsSuccess = useCallback(() => {
    // Don't navigate away immediately - let the user see the success state
    // They can click "Complete" to finish
  }, []);

  // Navigation handlers
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  // Store references to step action functions
  const walletActionRef = useRef<(() => void) | null>(null);
  const securityActionRef = useRef<(() => void) | null>(null);
  const systemActionRef = useRef<(() => void) | null>(null);
  const assetsActionRef = useRef<(() => void) | null>(null);

  const handleNext = useCallback(() => {
    console.log("🎮 handleNext called, currentStepId:", currentStepId);
    console.log("🎮 currentStepIndex:", currentStepIndex);
    console.log("🎮 steps:", steps);

    // If we're on wallet step and wallet, move to next step
    if (currentStepId === "wallet") {
      const nextStep = steps[currentStepIndex + 1];
      console.log("🎮 nextStep:", nextStep);
      if (nextStep) {
        // If going to security step, mark as explicit navigation (user clicked "Secure my wallet")
        if (nextStep.id === "security") {
          console.log(
            "🚀 Setting isExplicitSecurityNavigation to true - user clicked Secure my wallet"
          );
          setIsExplicitSecurityNavigation(true);
        }
        setCurrentStepId(nextStep.id);
      }
      return;
    }

    if (
      currentStepId === "security" &&
      !session?.user.pincodeEnabled &&
      securityActionRef.current
    ) {
      securityActionRef.current();
      return;
    }

    // If we're on security step and pincode already exists, move to next step
    if (currentStepId === "security" && session?.user.pincodeEnabled) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStepId(nextStep.id);
      }
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

    // If we're on system step and system already exists, move to next step
    if (currentStepId === "system" && systemAddress) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStepId(nextStep.id);
      }
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
  }, [
    currentStepId,
    session?.user.pincodeEnabled,
    systemAddress,
    systemDetails,
    currentStepIndex,
    steps,
    navigate,
  ]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStepId(prevStep.id);
      }
    }
  }, [currentStepIndex, steps]);

  // Determine if next button should be disabled
  const isNextDisabled = useCallback(() => {
    // For wallet step, enable button if no wallet (for generation) or if wallet exists (for navigation)
    if (currentStepId === "wallet") {
      return false; // Always enable button on wallet step
    }

    // For security step, enable button if no pincode (for setup) or if pincode exists (for navigation)
    if (currentStepId === "security") {
      return false; // Always enable button on security step
    }

    // For system step, enable button if no system (for deployment) or if system exists (for navigation)
    if (currentStepId === "system") {
      return false; // Always enable button on system step
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
  }, [
    currentStepId,
    systemDetails?.tokenFactories.length,
    steps,
    currentStepIndex,
  ]);

  // Determine button labels
  const getNextLabel = useCallback((): string => {
    if (currentStepId === "wallet") {
      return t("onboarding:ui.next");
    }
    if (currentStepId === "security" && !session?.user.pincodeEnabled) {
      return "Set PIN Code";
    }
    if (currentStepId === "security" && session?.user.pincodeEnabled) {
      return t("onboarding:ui.next");
    }
    if (currentStepId === "system" && !systemAddress) {
      return "Deploy System";
    }
    if (currentStepId === "system" && systemAddress) {
      return t("onboarding:ui.next");
    }
    if (
      currentStepId === "assets" &&
      (systemDetails?.tokenFactories.length ?? 0) === 0
    ) {
      return "Deploy Asset Factories";
    }
    if (currentStepIndex === steps.length - 1) {
      return t("onboarding:ui.complete");
    }
    return t("onboarding:ui.next");
  }, [
    currentStepId,
    session?.user.pincodeEnabled,
    systemAddress,
    systemDetails?.tokenFactories.length,
    currentStepIndex,
    steps.length,
    t,
  ]);

  const allowedTypes: OnboardingType[] = useMemo(() => ["platform"], []);

  const onRegisterWalletAction = useCallback((action: () => void) => {
    walletActionRef.current = action;
  }, []);

  const onRegisterSystemAction = useCallback((action: () => void) => {
    systemActionRef.current = action;
  }, []);

  const onRegisterAssetsAction = useCallback((action: () => void) => {
    assetsActionRef.current = action;
  }, []);

  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
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
              title={t("onboarding:card-title")}
              description={t("onboarding:card-description")}
              onStepChange={handleStepChange}
              showBackButton={currentStepIndex > 0}
              showNextButton={true}
              onBack={handleBack}
              onNext={handleNext}
              isBackDisabled={false}
              isNextDisabled={isNextDisabled()}
              nextLabel={getNextLabel()}
              backLabel={t("onboarding:ui.back")}
            >
              {(() => {
                if (currentStepId === "wallet") {
                  return (
                    <WalletStep
                      onSuccess={handleWalletSuccess}
                      onRegisterAction={onRegisterWalletAction}
                    />
                  );
                } else if (currentStepId === "security") {
                  console.log(
                    "🔍 Rendering WalletSecurityStep with forceShowSelection:",
                    isExplicitSecurityNavigation
                  );
                  return (
                    <WalletSecurityStep
                      onNext={handleSecuritySuccess}
                      onPrevious={handleWalletSuccess}
                      isFirstStep={false}
                      isLastStep={false}
                      forceShowSelection={isExplicitSecurityNavigation}
                    />
                  );
                } else if (currentStepId === "system") {
                  return (
                    <SystemStep
                      systemAddress={systemAddress}
                      isSystemDeployed={!!systemAddress}
                      onSuccess={handleSystemSuccess}
                      onRegisterAction={onRegisterSystemAction}
                    />
                  );
                } else if (currentStepId === "assets") {
                  return (
                    <AssetSelectionStep
                      onSuccess={handleAssetsSuccess}
                      onRegisterAction={onRegisterAssetsAction}
                    />
                  );
                } else {
                  return null;
                }
              })()}
            </StepWizard>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}
