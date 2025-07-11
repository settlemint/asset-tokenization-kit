import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { MultiStepWizard } from "@/components/multistep-form/multistep-wizard";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { WelcomeScreen } from "@/components/onboarding/steps/welcome-screen";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  useOnboardingSteps,
  type OnboardingFormData,
} from "@/hooks/use-onboarding-steps.tsx";
import { authClient } from "@/lib/auth/auth.client";
import type { OnboardingType } from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { createLogger } from "@settlemint/sdk-utils/logging";
import {
  createFileRoute,
  Link,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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

  // Check if we should show the welcome screen or go directly to the wizard
  // If there are URL parameters with step data, we should go directly to the wizard
  const location = useLocation();
  // TanStack Router stores search params in location.search as an object
  const hasUrlState =
    location.search &&
    typeof location.search === "object" &&
    Object.keys(location.search).length > 0;

  // State for welcome screen flow - use a more explicit approach
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  // Update showWelcomeScreen based on URL state
  useEffect(() => {
    if (hasUrlState) {
      setShowWelcomeScreen(false);
    }
  }, [hasUrlState]);

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

  // Always show system setup steps during platform onboarding
  // The wizard will handle step completion and navigation internally
  const shouldShowSystemSetupSteps = true;

  const shouldShowIdentitySteps = true; // Always show for now - in real app check if user has identity

  // Use the extracted hook for step definitions
  const { groups, steps, defaultValues } = useOnboardingSteps({
    user: session?.user,
    systemAddress,
    systemDetails,
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
  });

  console.log("PlatformNewOnboarding component rendering...");
  console.log("Steps:", steps.length);
  console.log("Groups:", groups.length);
  console.log("showWelcomeScreen:", showWelcomeScreen);
  console.log("systemAddress:", systemAddress);
  console.log("systemDetails:", systemDetails);

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

  // Handle starting the wizard
  const handleStartWalletSetup = useCallback(() => {
    setShowWelcomeScreen(false);
  }, []);

  // Memoize callback for back to welcome button
  const handleBackToWelcome = useCallback(() => {
    setShowWelcomeScreen(true);
  }, []);

  // Determine completed steps for welcome screen
  const completedSteps = useMemo(
    () => ({
      wallet: !!session?.user.pincodeEnabled, // Wallet is complete if user has secured it with PIN
      system: !!systemAddress, // System is complete if system address exists
      identity: false, // For now, identity is never complete during onboarding
    }),
    [session?.user.pincodeEnabled, systemAddress]
  );

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
          <WelcomeScreen
            onStartSetup={handleStartWalletSetup}
            completedSteps={completedSteps}
            systemDeployed={!!systemAddress}
            userName={user.name}
            isReturningUser={!!user.isOnboarded}
          />
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
