import { z } from "zod";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  MultiStepWizard,
  withWizardErrorBoundary,
} from "@/components/multistep-form";
import { useSettings } from "@/hooks/use-settings";
import { authClient } from "@/lib/auth/auth.client";
import type { OnboardingType } from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { Button } from "@/components/ui/button";
import {
  WelcomeScreen,
  WalletDisplayStep,
  WalletSecurityStep,
  RecoveryCodesStep,
} from "@/components/onboarding/steps";

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
  component: withWizardErrorBoundary(PlatformNewOnboarding),
});

// Define the onboarding form schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onboardingSchema = z.object({
  // Wallet Configuration
  walletGenerated: z.boolean().default(false),
  walletAddress: z.string().optional(),
  walletSecured: z.boolean().default(false),

  // System Bootstrap
  systemBootstrapped: z.boolean().default(false),
  systemAddress: z.string().optional(),

  // Asset Configuration
  selectedAssetTypes: z
    .array(z.enum(["equity", "bond", "deposit", "fund", "stablecoin"]))
    .default([]),
  assetFactoriesDeployed: z.boolean().default(false),

  // Add-ons Configuration
  selectedAddons: z
    .array(z.enum(["airdrops", "xvp", "yield", "governance", "analytics"]))
    .default([]),
  addonsConfigured: z.boolean().default(false),

  // Identity & KYC
  kycCompleted: z.boolean().default(false),
  identityRegistered: z.boolean().default(false),
  // KYC Data
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  residenceCountry: z.string().optional(),
  investorType: z.enum(["retail", "professional", "institutional"]).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

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

  // Get real-time system address from settings hook
  const [liveSystemAddress] = useSettings("SYSTEM_ADDRESS");

  // Use live system address if available, otherwise fall back to loader data
  const systemAddress = liveSystemAddress ?? loaderSystemAddress;

  const allowedTypes: OnboardingType[] = useMemo(() => ["platform"], []);

  // Check if steps should be shown based on current state
  const shouldShowWalletSteps = true; // Always show for demo - in real app: !user?.wallet
  const shouldShowSystemSteps = !systemAddress;
  const shouldShowAssetSteps =
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

    if (shouldShowSystemSteps) {
      dynamicGroups.push({
        id: "system",
        title: "System Bootstrap",
        description: "Initialize the blockchain system",
        collapsible: true,
        defaultExpanded: !shouldShowWalletSteps,
      });
    }

    if (shouldShowAssetSteps) {
      dynamicGroups.push({
        id: "assets",
        title: "System Setup",
        description: "Configure supported assets and add-ons",
        collapsible: true,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        defaultExpanded: !shouldShowWalletSteps && !shouldShowSystemSteps,
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
    shouldShowSystemSteps,
    shouldShowAssetSteps,
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
            user={user}
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
        component: ({
          form,
          stepId,
          onNext,
          onPrevious,
          isFirstStep,
          isLastStep,
        }) => (
          <WalletSecurityStep
            form={form}
            stepId={stepId}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            user={user}
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
        component: ({
          form,
          stepId,
          onNext,
          onPrevious,
          isFirstStep,
          isLastStep,
        }) => (
          <RecoveryCodesStep
            form={form}
            stepId={stepId}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            user={user}
          />
        ),
      });
    }

    // 2. System Steps (if system not bootstrapped)
    if (shouldShowSystemSteps) {
      dynamicSteps.push({
        id: "system-bootstrap",
        title: "Bootstrap System",
        description: "Initialize the blockchain system for first use",
        groupId: "system",
        fields: [
          {
            name: "systemBootstrapped",
            label: "Bootstrap System",
            type: "checkbox",
            description:
              "Initialize the core blockchain system (required for first user)",
          },
        ],
        validate: (data) => {
          if (!data.systemBootstrapped) {
            return "System bootstrap is required";
          }
          return undefined;
        },
        mutation: {
          mutationKey: "bootstrap-system",
          mutationFn: async function* (data: Partial<OnboardingFormData>) {
            if (data.systemBootstrapped) {
              yield { status: "pending", message: "Initializing system..." };
              await new Promise((resolve) => setTimeout(resolve, 1200));

              yield {
                status: "pending",
                message: "Deploying core contracts...",
              };
              await new Promise((resolve) => setTimeout(resolve, 1000));

              const systemAddress =
                "0x" + Math.random().toString(16).slice(2, 42);
              yield {
                status: "confirmed",
                message: "System bootstrapped successfully!",
                result: { systemAddress },
              };
              return { systemAddress };
            }
            return null;
          },
        },
      });
    }

    // 3. Asset Steps (if no assets configured)
    if (shouldShowAssetSteps) {
      dynamicSteps.push({
        id: "asset-selection",
        title: "Select Assets",
        description: "Choose which asset types your platform will support",
        groupId: "assets",
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
        groupId: "assets",
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

    // 4. Identity Steps (if no identity registered)
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
    shouldShowSystemSteps,
    shouldShowAssetSteps,
    shouldShowIdentitySteps,
    user,
  ]);

  const handleComplete = useCallback(
    async (data: OnboardingFormData) => {
      try {
        console.log("Onboarding completed with data:", data);
        toast.success(
          "Platform onboarding completed successfully! Welcome to your tokenization platform."
        );

        // Navigate to main dashboard
        await navigate({ to: "/" });
      } catch (error) {
        toast.error("Failed to complete onboarding");
        console.error("Onboarding completion error:", error);
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
  const handleStartWalletSetup = () => {
    setShowWelcomeScreen(false);
  };

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
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}
