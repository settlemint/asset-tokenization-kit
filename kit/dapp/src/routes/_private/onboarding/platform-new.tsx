import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { MultiStepWizard } from "@/components/multistep-form";
import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import {
  RecoveryCodesStep,
  SystemBootstrapStep,
  WalletDisplayStep,
  WalletSecurityStep,
} from "@/components/onboarding/steps";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  onboardingSchema,
  type OnboardingFormData,
  getAllowedOnboardingTypes,
  shouldShowWalletSteps as checkShouldShowWalletSteps,
  shouldShowSystemSetupSteps as checkShouldShowSystemSetupSteps,
  shouldShowIdentitySteps as checkShouldShowIdentitySteps,
} from "@/components/onboarding/onboarding-utils";
import { WelcomeScreenHandler } from "@/components/onboarding/welcome-screen-handler";
import {
  NoStepsAvailable,
  ErrorLoadingSteps,
} from "@/components/onboarding/error-states";

const logger = createLogger();

export const Route = createFileRoute("/_private/onboarding/platform-new")({
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
  component: PlatformNewOnboarding,
});

function PlatformNewOnboarding() {
  const { t } = useTranslation(["general", "onboarding"]);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // State for welcome screen flow
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  // Get data from loader
  const {
    user: preloadedUser,
    systemAddress: loaderSystemAddress,
    systemDetails,
  } = Route.useLoaderData();

  // Get user from session or loader data
  const user = session?.user ?? preloadedUser;

  // Use system address from loader data (no need for real-time updates during onboarding)
  const systemAddress = loaderSystemAddress;

  const allowedTypes: OnboardingType[] = useMemo(() => ["platform"], []);

  // Check if steps should be shown based on current state
  const shouldShowWalletSteps = true; // Always show for demo - in real app: !user?.wallet
  const shouldShowSystemSetupSteps =
    !systemAddress || (systemDetails?.tokenFactories.length ?? 0) === 0;
  const shouldShowIdentitySteps = true; // Always show for now - in real app check if user has identity

  // Define step groups with conditional logic
  const groups: StepGroup[] = useMemo(() => {
    const dynamicGroups: StepGroup[] = [];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (shouldShowWalletSteps) {
      dynamicGroups.push({
        id: "wallet",
        title: "Wallet Setup",
        description: "Create and secure your wallet",
        collapsible: true,
        defaultExpanded: true,
      });
    }

    if (shouldShowSystemSetupSteps) {
      dynamicGroups.push({
        id: "system",
        title: "System Setup",
        description: "Initialize blockchain and configure assets",
        collapsible: true,
        defaultExpanded: !shouldShowWalletSteps,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (shouldShowIdentitySteps) {
      dynamicGroups.push({
        id: "identity",
        title: "Identity Setup",
        description: "Complete KYC and register identity",
        collapsible: true,
        defaultExpanded: dynamicGroups.length === 0,
      });
    }

    return dynamicGroups;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
  ]);

  // Define wizard steps with conditional logic
  const steps: StepDefinition<OnboardingFormData>[] = useMemo(() => {
    const dynamicSteps: StepDefinition<OnboardingFormData>[] = [];

    // 1. Wallet Steps (if wallet not created or not secured)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (shouldShowWalletSteps) {
      // Always show wallet creation step for demo - in real app: if (!user?.wallet)
      dynamicSteps.push({
        id: "wallet-creation",
        title: "Create Your Wallet",
        description: "Generate a secure wallet for all blockchain operations",
        groupId: "wallet",
        fields: [],
        onStepComplete: async () => {
          // This will be called by WizardStep before markStepComplete
          return Promise.resolve();
        },
        component: ({
          form,
          stepId,
          onNext,
          onPrevious,
          isFirstStep,
          isLastStep,
        }) => (
          <WalletDisplayStep
            form={form}
            stepId={stepId}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            user={user as SessionUser}
          />
        ),
      });

      // Always add wallet security step for demo
      dynamicSteps.push({
        id: "wallet-security",
        title: "Secure Your Wallet",
        description: "Set up security verification for all operations",
        groupId: "wallet",
        fields: [],
        onStepComplete: async () => {
          // This will be called by WizardStep before markStepComplete
          return Promise.resolve();
        },
        component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
          <WalletSecurityStep
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            user={user as SessionUser}
          />
        ),
      });

      // Always add recovery codes step for demo
      dynamicSteps.push({
        id: "recovery-codes",
        title: "Recovery Codes",
        description: "Save your wallet recovery codes",
        groupId: "wallet",
        fields: [],
        onStepComplete: async () => {
          // This will be called by WizardStep before markStepComplete
          return Promise.resolve();
        },
        component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
          <RecoveryCodesStep
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            user={user as SessionUser}
          />
        ),
      });
    }

    // 2. System Setup Steps (bootstrap + assets)
    if (shouldShowSystemSetupSteps) {
      // First add bootstrap system step if system not bootstrapped
      if (!systemAddress) {
        dynamicSteps.push({
          id: "system-bootstrap",
          title: "Bootstrap System",
          description: "Initialize the blockchain system and set base currency",
          groupId: "system",
          fields: [],
          onStepComplete: async () => {
            return Promise.resolve();
          },
          component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
            <SystemBootstrapStep
              onNext={onNext}
              onPrevious={onPrevious}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              user={user as SessionUser}
            />
          ),
        });
      }

      // Then add asset configuration steps
      dynamicSteps.push({
        id: "asset-selection",
        title: "Select Assets",
        description: "Choose which asset types your platform will support",
        groupId: "system",
        fields: [
          {
            name: "selectedAssetTypes",
            label: "Asset Types",
            type: "checkbox",
            description:
              "Which assets do you want to support? At least one is required. Can be edited later in settings.",
            options: [
              { label: "Equity Tokens", value: "equity" },
              { label: "Bond Tokens", value: "bond" },
              { label: "Deposit Tokens", value: "deposit" },
              { label: "Fund Tokens", value: "fund" },
              { label: "Stablecoins", value: "stablecoin" },
            ],
          },
        ],
        validate: (data) => {
          if (
            !data.selectedAssetTypes ||
            data.selectedAssetTypes.length === 0
          ) {
            return "At least one asset type must be selected";
          }
          return undefined;
        },
      });

      dynamicSteps.push({
        id: "addon-selection",
        title: "Select Add-ons",
        description: "Configure additional platform features",
        groupId: "system",
        fields: [
          {
            name: "selectedAddons",
            label: "Platform Add-ons",
            type: "checkbox",
            description:
              "Which add-ons do you want to support? Can be edited later in settings.",
            options: [
              { label: "Airdrops", value: "airdrops" },
              { label: "XVP (Cross-chain Value Protocol)", value: "xvp" },
              { label: "Yield Management", value: "yield" },
              { label: "Governance", value: "governance" },
              { label: "Analytics", value: "analytics" },
            ],
          },
        ],
        validate: (data) => {
          // Yield is required if Bond was selected
          if (
            data.selectedAssetTypes?.includes("bond") &&
            !data.selectedAddons?.includes("yield")
          ) {
            return "Yield management is required when Bond tokens are selected";
          }
          return undefined;
        },
        mutation: {
          mutationKey: "configure-addons",
          mutationFn: async function* (data: Partial<OnboardingFormData>) {
            if (data.selectedAddons && data.selectedAddons.length > 0) {
              yield {
                status: "pending",
                message: "Configuring selected add-ons...",
              };
              await new Promise((resolve) => setTimeout(resolve, 1000));

              yield {
                status: "confirmed",
                message: `Configured ${data.selectedAddons.length} add-on(s) successfully!`,
              };
              return { addons: data.selectedAddons };
            }
            return { addons: [] };
          },
        },
      });
    }

    // 3. Identity Steps (if no identity registered)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (shouldShowIdentitySteps) {
      dynamicSteps.push({
        id: "kyc-information",
        title: "KYC Information",
        description: "Provide information for identity verification",
        groupId: "identity",
        fields: [
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            required: true,
            placeholder: "Enter your first name",
            schema: z.string().min(1, "First name is required"),
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            required: true,
            placeholder: "Enter your last name",
            schema: z.string().min(1, "Last name is required"),
          },
          {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "text",
            required: true,
            placeholder: "YYYY-MM-DD",
            schema: z.string().min(1, "Date of birth is required"),
          },
          {
            name: "nationality",
            label: "Nationality",
            type: "text",
            required: true,
            placeholder: "Your nationality",
            schema: z.string().min(1, "Nationality is required"),
          },
          {
            name: "residenceCountry",
            label: "Country of Residence",
            type: "text",
            required: true,
            placeholder: "Your country of residence",
            schema: z.string().min(1, "Country of residence is required"),
          },
          {
            name: "investorType",
            label: "Investor Type",
            type: "select",
            required: true,
            options: [
              { label: "Retail Investor", value: "retail" },
              { label: "Professional Investor", value: "professional" },
              { label: "Institutional Investor", value: "institutional" },
            ],
            description: "Select your investor classification",
          },
        ],
        validate: (data) => {
          const requiredFields = [
            "firstName",
            "lastName",
            "dateOfBirth",
            "nationality",
            "residenceCountry",
            "investorType",
          ];
          for (const field of requiredFields) {
            if (!data[field as keyof OnboardingFormData]) {
              return `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`;
            }
          }
          return undefined;
        },
      });

      dynamicSteps.push({
        id: "identity-registration",
        title: "Register Identity",
        description: "Complete identity registration on the blockchain",
        groupId: "identity",
        fields: [
          {
            name: "identityRegistered",
            label: "Register Identity on Blockchain",
            type: "checkbox",
            description:
              "This registers your identity in the factory and completes the onboarding process. This can only be done after system setup.",
          },
        ],
        validate: (data) => {
          if (!data.identityRegistered) {
            return "Identity registration is required to complete onboarding";
          }
          return undefined;
        },
        mutation: {
          mutationKey: "register-identity",
          mutationFn: async function* (data: Partial<OnboardingFormData>) {
            if (data.identityRegistered) {
              yield {
                status: "pending",
                message: "Storing KYC information...",
              };
              await new Promise((resolve) => setTimeout(resolve, 800));

              yield {
                status: "pending",
                message: "Registering identity on blockchain...",
              };
              await new Promise((resolve) => setTimeout(resolve, 1200));

              const identityId = "0x" + Math.random().toString(16).slice(2, 42);
              yield {
                status: "confirmed",
                message: "Identity registered successfully!",
                result: { identityId },
              };
              return { identityId };
            }
            return null;
          },
        },
      });
    }

    return dynamicSteps;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
    systemAddress,
    user,
  ]);

  const handleComplete = useCallback(
    async (data: OnboardingFormData) => {
      try {
        logger.debug("Onboarding completed with data:", data);
        toast.success(
          "Platform onboarding completed successfully! Welcome to your tokenization platform."
        );

        // Navigate to main dashboard
        await navigate({ to: "/" });
      } catch (error) {
        toast.error("Failed to complete onboarding");
        logger.error("Onboarding completion error:", error);
      }
    },
    [navigate]
  );

  // Calculate default values based on current state
  const defaultValues: Partial<OnboardingFormData> = {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    walletGenerated: Boolean(user?.wallet),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    walletAddress: user?.wallet,
    walletSecured: false, // Default to false for demo
    systemBootstrapped: Boolean(systemAddress),
    systemAddress: systemAddress ?? undefined,
    assetFactoriesDeployed: (systemDetails?.tokenFactories.length ?? 0) > 0,
    selectedAssetTypes: [],
    selectedAddons: [],
    kycCompleted: false,
    identityRegistered: false,
  };

  // Handle starting the wizard
  const handleStartWalletSetup = useCallback(() => {
    logger.debug(
      "Starting wallet setup, steps:",
      steps.length,
      steps.map((s) => s.id)
    );
    logger.debug(
      "Groups:",
      groups.length,
      groups.map((g) => g.id)
    );
    logger.debug("System address:", systemAddress);
    logger.debug("Should show conditions:", {
      shouldShowWalletSteps,
      shouldShowSystemSetupSteps,
      shouldShowIdentitySteps,
    });
    setShowWelcomeScreen(false);
  }, [
    steps,
    groups,
    systemAddress,
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
  ]);

  // Memoize callback for back to welcome button
  const handleBackToWelcome = useCallback(() => {
    setShowWelcomeScreen(true);
  }, []);

  // If showing welcome screen, render it without the wizard
  if (showWelcomeScreen) {
    return (
      <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
        <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
          {/* Logo positioned in top-left */}
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

          {/* Language and theme toggles positioned in top-right */}
          <div className="absolute top-8 right-8 flex gap-2">
            <Link to="/onboarding/platform">
              <Button
                variant="outline"
                size="sm"
                className="bg-background/10 border-border/20 text-foreground hover:bg-background/20"
              >
                Use Original
              </Button>
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {/* Welcome Screen Content */}
          <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-2xl px-4">
              <WelcomeScreen onStartSetup={handleStartWalletSetup} />
            </div>
          </div>
        </div>
      </OnboardingGuard>
    );
  }

  // Debug: Check if steps array is empty
  if (steps.length === 0) {
    return (
      <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
        <div className="min-h-screen w-full flex items-center justify-center bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
          <div className="text-center p-8 bg-background/80 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">No Steps Available</h2>
            <p className="text-muted-foreground mb-4">
              Debug Info: Steps: {steps.length}, Groups: {groups.length}
            </p>
            <p className="text-sm text-muted-foreground">
              shouldShowWalletSteps: {String(shouldShowWalletSteps)}
              <br />
              shouldShowSystemSetupSteps: {String(shouldShowSystemSetupSteps)}
              <br />
              shouldShowIdentitySteps: {String(shouldShowIdentitySteps)}
              <br />
              systemAddress: {systemAddress ?? "null"}
            </p>
            <Button onClick={handleBackToWelcome} className="mt-4">
              Back to Welcome
            </Button>
          </div>
        </div>
      </OnboardingGuard>
    );
  }

  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
      <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
        {/* Logo positioned in top-left */}
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

        {/* Language and theme toggles positioned in top-right */}
        <div className="absolute top-8 right-8 flex gap-2">
          <Link to="/onboarding/platform">
            <Button
              variant="outline"
              size="sm"
              className="bg-background/10 border-border/20 text-foreground hover:bg-background/20"
            >
              Use Original
            </Button>
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Centered content area with step wizard */}
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-6xl px-4">
            <ComponentErrorBoundary componentName="Onboarding Wizard">
              <MultiStepWizard<OnboardingFormData>
                name="Let's get you set up!"
                description="We'll set up your wallet and will configure your identity on the blockchain to use this platform."
                steps={steps}
                groups={groups}
                onComplete={handleComplete}
                enableUrlPersistence={true}
                showProgressBar={true}
                allowStepSkipping={true}
                defaultValues={defaultValues}
              />
            </ComponentErrorBoundary>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}
