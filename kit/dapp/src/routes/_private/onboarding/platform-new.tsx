import { z } from "zod";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MultiStepWizard, withWizardErrorBoundary } from "@/components/multistep-form";
import { useSettings } from "@/hooks/use-settings";
import { authClient } from "@/lib/auth/auth.client";
import type { OnboardingType } from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { StepDefinition, StepGroup } from "@/components/multistep-form/types";
import { Button } from "@/components/ui/button";

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
  // Platform Setup
  platformName: z.string().min(1, "Platform name is required"),
  platformDescription: z.string().optional(),
  
  // Wallet Configuration
  walletGenerated: z.boolean().default(false),
  walletAddress: z.string().optional(),
  
  // Security Setup
  pincodeEnabled: z.boolean().default(false),
  backupCompleted: z.boolean().default(false),
  
  // System Deployment
  systemDeployed: z.boolean().default(false),
  systemAddress: z.string().optional(),
  networkSelected: z.enum(["local", "testnet", "mainnet"]).default("local"),
  
  // Asset Configuration
  assetFactoriesDeployed: z.boolean().default(false),
  selectedAssetTypes: z.array(z.enum(["equity", "bond", "deposit", "fund", "stablecoin"])).default([]),
  
  // Compliance Settings
  kycRequired: z.boolean().default(false),
  complianceRegion: z.string().optional(),
  regulatoryFramework: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

function PlatformNewOnboarding() {
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

  const allowedTypes: OnboardingType[] = useMemo(() => ["platform"], []);

  // Define step groups
  const groups: StepGroup[] = [
    {
      id: "setup",
      title: "Platform Setup",
      description: "Configure your platform basics",
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: "security",
      title: "Security & Wallet",
      description: "Secure your platform",
      collapsible: true,
      defaultExpanded: false,
    },
    {
      id: "deployment",
      title: "System Deployment",
      description: "Deploy blockchain infrastructure",
      collapsible: true,
      defaultExpanded: false,
    },
    {
      id: "configuration",
      title: "Configuration",
      description: "Configure assets and compliance",
      collapsible: true,
      defaultExpanded: false,
    },
  ];

  // Define wizard steps
  const steps: StepDefinition<OnboardingFormData>[] = [
    {
      id: "platform-info",
      title: "Platform Information",
      description: "Set up your platform's basic information",
      groupId: "setup",
      fields: [
        {
          name: "platformName",
          label: "Platform Name",
          type: "text",
          required: true,
          placeholder: "My Asset Tokenization Platform",
          description: "Choose a name for your tokenization platform",
          schema: z.string().min(1, "Platform name is required"),
        },
        {
          name: "platformDescription",
          label: "Platform Description",
          type: "textarea",
          placeholder: "A platform for tokenizing real-world assets...",
          description: "Optional description of your platform's purpose",
        },
      ],
    },
    {
      id: "wallet-setup",
      title: "Wallet Generation",
      description: "Generate your platform wallet",
      groupId: "security",
      fields: [
        {
          name: "walletGenerated",
          label: "Generate Platform Wallet",
          type: "checkbox",
          description: "Generate a secure wallet for your platform operations",
        },
      ],
      validate: async (data) => {
        if (!data.walletGenerated) {
          return "Platform wallet must be generated to continue";
        }
        return undefined;
      },
      mutation: {
        mutationKey: "generate-wallet",
        mutationFn: async (data: Partial<OnboardingFormData>) => {
          if (data.walletGenerated) {
            // Simulate wallet generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { address: "0x" + Math.random().toString(16).slice(2, 42) };
          }
          return null;
        },
      },
    },
    {
      id: "security-setup",
      title: "Security Configuration",
      description: "Set up security measures",
      groupId: "security",
      fields: [
        {
          name: "pincodeEnabled",
          label: "Enable PIN Code Protection",
          type: "checkbox",
          description: "Require PIN code for sensitive operations",
        },
        {
          name: "backupCompleted",
          label: "Backup Wallet Phrase",
          type: "checkbox",
          description: "Complete wallet backup for recovery",
          dependsOn: (data) => !!data.pincodeEnabled,
        },
      ],
      validate: async (data) => {
        if (data.pincodeEnabled && !data.backupCompleted) {
          return "Wallet backup must be completed when PIN is enabled";
        }
        return undefined;
      },
    },
    {
      id: "network-selection",
      title: "Network Selection",
      description: "Choose your deployment network",
      groupId: "deployment",
      fields: [
        {
          name: "networkSelected",
          label: "Deployment Network",
          type: "select",
          required: true,
          options: [
            { label: "Local Development", value: "local" },
            { label: "Testnet", value: "testnet" },
            { label: "Mainnet", value: "mainnet" },
          ],
          description: "Select the blockchain network for deployment",
        },
      ],
    },
    {
      id: "system-deployment",
      title: "System Deployment",
      description: "Deploy core system contracts",
      groupId: "deployment",
      fields: [
        {
          name: "systemDeployed",
          label: "Deploy System Contracts",
          type: "checkbox",
          description: "Deploy the core tokenization system to the blockchain",
        },
      ],
      validate: async (data) => {
        if (!data.systemDeployed) {
          return "System contracts must be deployed to continue";
        }
        return undefined;
      },
      mutation: {
        mutationKey: "deploy-system",
        mutationFn: async (data: Partial<OnboardingFormData>) => {
          if (data.systemDeployed) {
            // System creation requires PIN verification
            // In a real implementation, you'd collect the PIN from the user
            // For now, this is just a placeholder
            toast.error("System deployment requires PIN verification. Please use the standard onboarding flow.");
            return null;
          }
          return null;
        },
      },
    },
    {
      id: "asset-types",
      title: "Asset Type Selection",
      description: "Choose which asset types to support",
      groupId: "configuration",
      fields: [
        {
          name: "selectedAssetTypes",
          label: "Supported Asset Types",
          type: "checkbox",
          description: "Select the types of assets your platform will support",
          options: [
            { label: "Equity Tokens", value: "equity" },
            { label: "Bond Tokens", value: "bond" },
            { label: "Deposit Tokens", value: "deposit" },
            { label: "Fund Tokens", value: "fund" },
            { label: "Stablecoins", value: "stablecoin" },
          ],
        },
      ],
      validate: async (data) => {
        if (!data.selectedAssetTypes || data.selectedAssetTypes.length === 0) {
          return "At least one asset type must be selected";
        }
        return undefined;
      },
    },
    {
      id: "asset-deployment",
      title: "Asset Factory Deployment",
      description: "Deploy asset factory contracts",
      groupId: "configuration",
      fields: [
        {
          name: "assetFactoriesDeployed",
          label: "Deploy Asset Factories",
          type: "checkbox",
          description: "Deploy factory contracts for selected asset types",
          dependsOn: (data) => (data.selectedAssetTypes?.length || 0) > 0,
        },
      ],
      validate: async (data) => {
        if (data.selectedAssetTypes && data.selectedAssetTypes.length > 0 && !data.assetFactoriesDeployed) {
          return "Asset factories must be deployed for selected asset types";
        }
        return undefined;
      },
      mutation: {
        mutationKey: "deploy-asset-factories",
        mutationFn: async (data: Partial<OnboardingFormData>) => {
          if (data.assetFactoriesDeployed && data.selectedAssetTypes) {
            // Factory creation requires PIN verification
            // In a real implementation, you'd collect the PIN from the user
            toast.error("Factory deployment requires PIN verification. Please use the standard onboarding flow.");
            return null;
          }
          return null;
        },
      },
    },
    {
      id: "compliance-setup",
      title: "Compliance Configuration",
      description: "Configure regulatory compliance",
      groupId: "configuration",
      fields: [
        {
          name: "kycRequired",
          label: "Require KYC Verification",
          type: "checkbox",
          description: "Require Know Your Customer verification for users",
        },
        {
          name: "complianceRegion",
          label: "Primary Compliance Region",
          type: "select",
          dependsOn: (data) => !!data.kycRequired,
          options: [
            { label: "European Union (GDPR)", value: "eu" },
            { label: "United States (SEC)", value: "us" },
            { label: "Asia Pacific", value: "apac" },
            { label: "Other", value: "other" },
          ],
          description: "Select your primary regulatory jurisdiction",
        },
        {
          name: "regulatoryFramework",
          label: "Regulatory Framework",
          type: "text",
          dependsOn: (data) => data.complianceRegion === "other",
          placeholder: "Specify your regulatory framework",
          description: "Specify the regulatory framework you'll follow",
        },
      ],
    },
  ];

  const handleComplete = async (_data: OnboardingFormData) => {
    try {
      toast.success("Platform onboarding completed successfully!");
      
      // Navigate to main dashboard
      await navigate({ to: "/" });
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error("Onboarding completion error:", error);
    }
  };

  // Calculate default values based on current state
  const defaultValues: Partial<OnboardingFormData> = {
    walletGenerated: !!user?.wallet,
    walletAddress: user?.wallet,
    pincodeEnabled: !!session?.user.pincodeEnabled,
    systemDeployed: !!systemAddress,
    systemAddress: systemAddress || undefined,
    assetFactoriesDeployed: (systemDetails?.tokenFactories.length || 0) > 0,
    networkSelected: "local",
    selectedAssetTypes: [],
    kycRequired: false,
  };

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
            <Button variant="outline" size="sm" className="bg-background/10 border-border/20 text-foreground hover:bg-background/20">
              Use Original
            </Button>
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Main content area with MultiStepWizard */}
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-7xl px-4 py-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Platform Setup Wizard
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Configure your asset tokenization platform step by step
              </p>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 rounded-lg shadow-xl">
              <MultiStepWizard<OnboardingFormData>
                name="platform-onboarding"
                steps={steps}
                groups={groups}
                onComplete={handleComplete}
                enableUrlPersistence={true}
                showProgressBar={true}
                allowStepSkipping={false}
                persistFormData={true}
                defaultValues={defaultValues}
                className="p-6"
                sidebarClassName="border-r border-border/40"
                contentClassName="pl-6"
              />
            </div>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}