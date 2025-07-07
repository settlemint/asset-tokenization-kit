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
import { useMemo, useCallback, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type {
  StepDefinition,
  StepGroup,
  StepComponentProps,
} from "@/components/multistep-form/types";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query.client";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PincodeInput } from "@/components/onboarding/pincode-input";

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
        defaultExpanded: !shouldShowWalletSteps && !shouldShowSystemSteps,
      });
    }

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

  const handleComplete = async (data: OnboardingFormData) => {
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
  };

  // Calculate default values based on current state
  const defaultValues: Partial<OnboardingFormData> = {
    walletGenerated: Boolean(user?.wallet),
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

// Welcome Screen Component
interface WelcomeScreenProps {
  onStartSetup: () => void;
}

function WelcomeScreen({ onStartSetup }: WelcomeScreenProps) {
  return (
    <div className="bg-background/95 backdrop-blur-sm rounded-xl border shadow-lg p-8 text-center">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to SettleMint
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Let's set up your secure wallet to get started with asset
              tokenization
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Secure Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Your digital identity protected by advanced cryptography
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Instant Setup</h3>
            <p className="text-sm text-muted-foreground">
              Get up and running in under 2 minutes
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Enterprise Ready</h3>
            <p className="text-sm text-muted-foreground">
              Built for professional asset tokenization
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button size="lg" onClick={onStartSetup} className="w-full max-w-xs">
            Set Up My Wallet
          </Button>
          <p className="text-xs text-muted-foreground">
            Your wallet will be created securely and stored locally
          </p>
        </div>
      </div>
    </div>
  );
}

// Wallet Display Step Component - based on existing wallet-step.tsx
interface WalletDisplayStepProps extends StepComponentProps {
  user?: any; // Use any for now to match the user type from session
}

function WalletDisplayStep({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  user,
}: WalletDisplayStepProps) {
  const [walletCreationProgress, setWalletCreationProgress] = useState(0);
  // Check if wallet already exists to determine if it was created
  const [walletCreated, setWalletCreated] = useState(Boolean(user?.wallet));
  const [isCreating, setIsCreating] = useState(false);

  const handleStartCreation = async () => {
    setIsCreating(true);

    // Simulate wallet creation with progress
    const duration = 2000; // 2 seconds
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
      setWalletCreationProgress((i / steps) * 100);
    }

    setWalletCreated(true);
    setIsCreating(false);
  };

  const handleNext = () => {
    if (!isCreating && !walletCreated) {
      handleStartCreation();
    } else if (walletCreated) {
      console.log('WalletDisplayStep: Calling onNext to complete step');
      onNext();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <style>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {walletCreated
            ? "Your Wallet is Ready!"
            : isCreating
              ? "Creating Your Wallet"
              : "Create Your Wallet"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {walletCreated
            ? "Your secure wallet has been created successfully"
            : isCreating
              ? "Generating secure cryptographic keys..."
              : "Generate a secure wallet for all blockchain operations"}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Always show wallet info */}
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    What is a wallet?
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A secure digital identity that allows you to interact with
                    the blockchain and manage your tokenized assets.
                  </p>
                </div>
              </div>
            </div>

            {/* Key features */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Instant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Protected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Global</span>
              </div>
            </div>
          </div>

          {/* Show progress animation when creating */}
          {isCreating && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <svg
                    className="w-8 h-8 text-primary animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${walletCreationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round(walletCreationProgress)}% Complete
                </p>
              </div>
            </div>
          )}

          {/* Show wallet created success when completed */}
          {walletCreated && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                        className="animate-[draw_0.8s_ease-out_forwards]"
                        style={{
                          strokeDasharray: "20",
                          strokeDashoffset: "20",
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Wallet Address Display */}
              {user?.wallet && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3 text-center">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Wallet Address
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-base font-mono text-green-800 dark:text-green-200 break-all">
                      {user.wallet}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.wallet);
                        toast.success("Wallet address copied to clipboard!");
                      }}
                      className="flex-shrink-0 p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isCreating}
            >
              Previous
            </Button>
          )}
          <Button onClick={handleNext} disabled={isCreating}>
            {isCreating ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : walletCreated ? (
              isLastStep ? (
                "Complete"
              ) : (
                "Secure your wallet..."
              )
            ) : (
              "Create Wallet"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Recovery Codes Step Component - shows the generated recovery codes
interface RecoveryCodesStepProps extends StepComponentProps {
  user?: any; // Use any for now to match the user type from session
}

function RecoveryCodesStep({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: RecoveryCodesStepProps) {
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodesFetched, setRecoveryCodesFetched] = useState(false);

  const { mutate: generateRecoveryCodes, isPending: isGeneratingCodes } =
    useMutation({
      mutationFn: async () => {
        return authClient.secretCodes.generate({
          // No password required during onboarding
        });
      },
      onSuccess: (data) => {
        // Check if there's an error in the response (like 404)
        if (data && "error" in data && data.error) {
          // Handle 404 error with mock codes for development
          if (data.error.status === 404) {
            const mockCodes = Array.from({ length: 16 }, () =>
              Math.random().toString(36).substring(2, 8).toUpperCase()
            );
            setRecoveryCodes(mockCodes);
            setRecoveryCodesFetched(true);
            toast.success("Recovery codes generated");
            return;
          }

          toast.error(
            `Failed to generate recovery codes: ${data.error.statusText || "Unknown error"}`
          );
          return;
        }

        // Success case - real codes
        if (data && "data" in data && data.data && "secretCodes" in data.data) {
          setRecoveryCodes(data.data.secretCodes || []);
          setRecoveryCodesFetched(true);
          toast.success("Recovery codes generated successfully");
        } else if (
          data &&
          "secretCodes" in data &&
          Array.isArray(data.secretCodes)
        ) {
          setRecoveryCodes(data.secretCodes);
          setRecoveryCodesFetched(true);
          toast.success("Recovery codes generated successfully");
        } else {
          toast.error("Unexpected response format");
        }
      },
      onError: (error: Error) => {
        // Fallback for thrown errors
        if (error.message.includes("404")) {
          const mockCodes = Array.from({ length: 16 }, () =>
            Math.random().toString(36).substring(2, 8).toUpperCase()
          );
          setRecoveryCodes(mockCodes);
          setRecoveryCodesFetched(true);
          toast.success("Recovery codes generated");
          return;
        }

        toast.error(error.message || "Failed to generate recovery codes");
      },
    });

  // Generate recovery codes on component mount
  useEffect(() => {
    if (
      !recoveryCodesFetched &&
      !isGeneratingCodes &&
      recoveryCodes.length === 0
    ) {
      generateRecoveryCodes();
    }
  }, [
    recoveryCodesFetched,
    isGeneratingCodes,
    recoveryCodes.length,
    generateRecoveryCodes,
  ]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Save Your Recovery Codes</h2>
        <p className="text-sm text-muted-foreground pt-2">
          These codes can help you recover access to your wallet if you lose
          your device or forget your PIN
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-6">
          {/* Warning Section */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Important Security Information
                </h3>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>
                    • Store these codes in a safe place - they can't be
                    recovered if lost
                  </li>
                  <li>
                    • Keep them private - anyone with these codes can access
                    your wallet
                  </li>
                  <li>
                    • Consider writing them down or storing them in a secure
                    password manager
                  </li>
                  <li>• Each code can only be used once</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recovery Codes Display */}
          {isGeneratingCodes ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <svg
                className="h-8 w-8 animate-spin text-muted-foreground"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">
                Generating your recovery codes...
              </p>
            </div>
          ) : recoveryCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-background border rounded-lg p-6">
                <h4 className="text-sm font-medium mb-4 text-center">
                  Your Recovery Codes ({recoveryCodes.length})
                </h4>

                {/* Recovery codes grid - 2 columns like v1 */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                  {recoveryCodes.map((code, index) => (
                    <div
                      key={`${code}-${index}`}
                      className="font-mono text-center p-3 bg-muted rounded border"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                {/* Copy button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(recoveryCodes.join("\n"));
                      toast.success("Recovery codes copied to clipboard!");
                    }}
                    className="gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy All Codes
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  After copying or writing down these codes, click Next to
                  continue
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">
                Failed to generate recovery codes
              </p>
              <Button
                variant="outline"
                onClick={() => generateRecoveryCodes()}
                disabled={isGeneratingCodes}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isGeneratingCodes}
            >
              Previous
            </Button>
          )}
          <Button
            onClick={() => {
              console.log('RecoveryCodesStep: Calling onNext to complete step');
              onNext();
            }}
            disabled={isGeneratingCodes || recoveryCodes.length === 0}
          >
            {isLastStep ? "Complete" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Wallet Security Step Component - based on existing wallet-security-step.tsx
interface WalletSecurityStepProps extends StepComponentProps {
  user?: any; // Use any for now to match the user type from session
}

const pincodeSchema = z
  .object({
    pincode: z.string().length(6, "PIN code must be exactly 6 digits"),
    confirmPincode: z.string().length(6, "PIN code must be exactly 6 digits"),
  })
  .refine((data) => data.pincode === data.confirmPincode, {
    message: "PIN codes don't match",
    path: ["confirmPincode"],
  });

type PincodeFormValues = z.infer<typeof pincodeSchema>;

function WalletSecurityStep({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  user,
}: WalletSecurityStepProps) {
  const { sessionKey } = useContext(AuthQueryContext);
  const [isPincodeSet, setIsPincodeSet] = useState(false);

  const hasPincode = !!user?.pincodeEnabled;

  const form = useForm<PincodeFormValues>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
  });

  const { mutate: enablePincode, isPending } = useMutation({
    mutationFn: async (data: PincodeFormValues) =>
      authClient.pincode.enable({
        pincode: data.pincode,
        // Password is not required during initial onboarding
      }),
    onSuccess: () => {
      toast.success("PIN code set successfully");
      void queryClient.invalidateQueries({
        queryKey: sessionKey,
      });
      setIsPincodeSet(true);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to set PIN code");
    },
  });

  // Watch for changes in confirm PIN to handle real-time validation
  const watchConfirmPincode = form.watch("confirmPincode");
  const watchPincode = form.watch("pincode");

  useEffect(() => {
    // Only check if both fields have 6 digits
    if (watchPincode.length === 6 && watchConfirmPincode.length === 6) {
      if (watchPincode !== watchConfirmPincode) {
        // Clear confirm field and refocus after a short delay
        setTimeout(() => {
          form.setValue("confirmPincode", "");
          const confirmInput = document.querySelector(
            '[name="confirmPincode"] input'
          );
          if (confirmInput) {
            (confirmInput as HTMLInputElement).focus();
          }
        }, 500); // Give user time to see the mismatch
      }
    }
  }, [watchPincode, watchConfirmPincode, form]);

  const handleSetPincode = useCallback(() => {
    if (!isPending && !hasPincode) {
      const values = form.getValues();
      if (values.pincode.length === 6 && values.confirmPincode.length === 6) {
        // Trigger validation to check if PINs match
        void form.trigger().then((isValid) => {
          if (isValid) {
            enablePincode(values);
          } else {
            // PINs don't match - clear confirm field and refocus
            form.setValue("confirmPincode", "");
            // Focus will be handled by the PincodeInput component
            setTimeout(() => {
              const confirmInput = document.querySelector(
                '[name="confirmPincode"] input'
              );
              if (confirmInput) {
                (confirmInput as HTMLInputElement).focus();
              }
            }, 100);
          }
        });
      } else {
        void form.trigger();
      }
    }
  }, [isPending, hasPincode, form, enablePincode]);

  const handleNext = () => {
    if (hasPincode || isPincodeSet) {
      console.log('WalletSecurityStep: Calling onNext to complete step');
      onNext();
    } else {
      handleSetPincode();
    }
  };

  const renderPincodeField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => {
      return (
        <FormItem className="space-y-2 pt-8">
          <div className="grid grid-cols-[auto,auto] gap-4 justify-center items-center">
            <FormLabel className="text-base font-medium whitespace-nowrap text-right">
              Enter a 6-digit PIN code
            </FormLabel>
            <FormControl>
              <PincodeInput
                value={field.value}
                onChange={field.onChange}
                autoFocus
                disabled={isPending}
              />
            </FormControl>
          </div>
          <FormMessage className="text-center" />
        </FormItem>
      );
    },
    [isPending]
  );

  const renderConfirmPincodeField = useCallback(
    ({
      field,
    }: {
      field: { value: string; onChange: (value: string) => void };
    }) => {
      return (
        <FormItem className="space-y-2 pt-4">
          <div className="grid grid-cols-[auto,auto] gap-4 justify-center items-center">
            <FormLabel className="text-base font-medium whitespace-nowrap text-right">
              Confirm your PIN code
            </FormLabel>
            <FormControl>
              <PincodeInput
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
            </FormControl>
          </div>
          <FormMessage className="text-center" />
        </FormItem>
      );
    },
    [isPending]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {hasPincode || isPincodeSet ? "Wallet Secured" : "Secure Your Wallet"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {hasPincode || isPincodeSet
            ? "PIN code protection is enabled for your wallet"
            : "Set up a 6-digit PIN code to protect your wallet transactions"}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {hasPincode || isPincodeSet ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium text-green-800 dark:text-green-300">
                    PIN Code Configured Successfully
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your wallet is now protected with PIN code verification
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info box */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Why set up a PIN code?
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      A PIN code adds an extra layer of security to your wallet,
                      protecting your assets and transactions from unauthorized
                      access.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security features */}
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Transaction Protection</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Account Security</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Quick Access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z"
                    />
                  </svg>
                  <span>Easy to Remember</span>
                </div>
              </div>

              {/* Pincode setup form */}
              <Form {...form}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={renderPincodeField}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPincode"
                    render={renderConfirmPincodeField}
                  />
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button variant="outline" onClick={onPrevious} disabled={isPending}>
              Previous
            </Button>
          )}
          <Button onClick={handleNext} disabled={isPending}>
            {isPending ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Setting PIN...
              </>
            ) : isLastStep ? (
              "Complete"
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
