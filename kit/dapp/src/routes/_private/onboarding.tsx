/**
 * Authentication Layout Route
 *
 * This module defines the layout wrapper for all authentication pages,
 * providing a consistent visual design and user experience across login,
 * registration, and other auth flows.
 *
 * The layout features:
 * - Full-screen background with theme-aware imagery
 * - Application branding in the top-left corner
 * - User controls (language switcher, theme toggle) in the top-right
 * - Centered content area for authentication forms
 *
 * This route serves as a parent for all /auth/* routes, ensuring they
 * share the same visual styling and layout structure.
 *
 * @see {@link ./auth.$pathname} - Dynamic auth route for specific auth pages
 */

import { StepWizard, type Step } from "@/components/kit/step-wizard";
import { SystemStep, WalletStep } from "@/components/kit/step-wizard/steps";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { seo } from "@/config/metadata";
<<<<<<< HEAD
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
=======
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { cn } from "@/lib/utils";
import type { SystemCreateMessages } from "@/orpc/routes/system/routes/system.create.schema";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation, useQuery } from "@tanstack/react-query";
>>>>>>> origin
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingComponent,
  head: () => ({
    meta: [
      ...seo({
        title: "Onboarding",
      }),
    ],
  }),
});

<<<<<<< HEAD
const STEPS: Step[] = [
  {
    id: "wallet",
    title: "Generate Wallet",
    description: "Create your secure blockchain wallet",
    status: "pending",
  },
  {
    id: "system",
    title: "Deploy System",
    description: "Deploy your SMART tokenization system",
    status: "pending",
  },
];

=======
/**
 * Onboarding Component
 *
 * Guides new users through the initial setup process for the SettleMint Asset Tokenization Kit.
 * This component handles the following onboarding steps:
 *
 * 1. Wallet Generation - Creates a new blockchain wallet for the user
 * 2. MFA Setup (commented out) - Secures the wallet with multi-factor authentication
 * 3. System Deployment - Deploys the SMART system contracts required for the platform
 *
 * The component tracks user progress through the onboarding flow and provides
 * real-time feedback for blockchain operations using server-sent events.
 *
 * @returns The onboarding UI with step-by-step actions for platform setup
 */
>>>>>>> origin
function OnboardingComponent() {
  const { orpc } = Route.useRouteContext();
  const navigate = useNavigate();
  const { data: user, isError, error } = useQuery(orpc.user.me.queryOptions());
  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );
  const { t } = useTranslation(["onboarding", "general"]);

  const [currentStepId, setCurrentStepId] = useState("wallet");
  const [steps, setSteps] = useState<Step[]>(STEPS);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);

  // Handle authentication errors
  useEffect(() => {
    if (isError) {
      // For ORPC errors, the error object will have a code property
      const errorObj = error as { code?: string };
      if (errorObj.code === "UNAUTHORIZED") {
        void navigate({
          to: "/auth/$pathname",
          params: { pathname: "signin" },
          replace: true,
        });
      }
    }
  }, [isError, error, navigate]);

<<<<<<< HEAD
  // Update step statuses based on current state
  useEffect(() => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === "wallet") {
          return {
            ...step,
            status: user?.wallet ? "completed" : "active",
          };
        }
        if (step.id === "system") {
          const isWalletComplete = !!user?.wallet;
          return {
            ...step,
            status: systemAddress
              ? "completed"
              : isWalletComplete
                ? "active"
                : "pending",
          };
        }
        return step;
      })
    );
  }, [user?.wallet, systemAddress]);

  // Auto-advance to next incomplete step (only if user hasn't manually navigated)
  useEffect(() => {
    // Only auto-advance if user hasn't manually navigated
    if (
      !hasManuallyNavigated &&
      user?.wallet &&
      currentStepId === "wallet" &&
      !systemAddress
    ) {
      // Small delay to allow user to see completion before advancing
      const timeout = setTimeout(() => {
        setCurrentStepId("system");
      }, 1500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [user?.wallet, systemAddress, currentStepId, hasManuallyNavigated]);

  const handleStepChange = (stepId: string) => {
    setHasManuallyNavigated(true);
    setCurrentStepId(stepId);
  };

  const handleWalletComplete = () => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === "wallet" ? { ...step, status: "completed" } : step
      )
    );
    // Only auto-advance if user hasn't manually navigated
    if (!hasManuallyNavigated) {
      setTimeout(() => {
        setCurrentStepId("system");
      }, 2000);
    }
  };

  const handleSystemComplete = () => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === "system" ? { ...step, status: "completed" } : step
      )
    );
    // Navigate to main app or show completion message
    void navigate({ to: "/" });
  };

  const renderStepContent = () => {
    switch (currentStepId) {
      case "wallet":
        return (
          <WalletStep
            orpc={orpc}
            user={user}
            onComplete={handleWalletComplete}
          />
        );
      case "system":
        return <SystemStep orpc={orpc} onComplete={handleSystemComplete} />;
      default:
        return null;
    }
  };
=======
  const { mutate: generateWallet } = useMutation(
    orpc.account.create.mutationOptions({
      onSuccess: async () => {
        toast.success(t("onboarding:wallet-generated"));
        await authClient.getSession({
          query: {
            disableCookieCache: true,
          },
        });
        void queryClient.invalidateQueries({
          queryKey: sessionKey,
        });
        void queryClient.invalidateQueries({
          queryKey: orpc.user.me.key(),
        });
      },
      onError: (error) => {
        // The error message will be the localized message from the server
        toast.error(error.message);
      },
    })
  );

  const {
    mutate: createSystem,
    isPending: isCreatingSystem,
    isTracking,
  } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions(),
    onSuccess: (data) => {
      setSystemAddress(data);
    },
    messages: {
      // Frontend messages for toast notifications
      initialLoading: t("onboarding:create-system-messages.initial-loading"),
      noResultError: t("onboarding:create-system-messages.no-result-error"),
      defaultError: t("onboarding:create-system-messages.default-error"),
      // Backend messages that will be passed to the mutation
      mutationMessages: {
        // System-specific messages
        systemCreated: t("onboarding:create-system-messages.system-created"),
        creatingSystem: t("onboarding:create-system-messages.creating-system"),
        systemCreationFailed: t(
          "onboarding:create-system-messages.system-creation-failed"
        ),
        // Transaction tracking messages
        streamTimeout: t(
          "onboarding:create-system-messages.transaction-tracking.stream-timeout"
        ),
        waitingForMining: t(
          "onboarding:create-system-messages.transaction-tracking.waiting-for-mining"
        ),
        transactionFailed: t(
          "onboarding:create-system-messages.transaction-tracking.transaction-failed"
        ),
        transactionDropped: t(
          "onboarding:create-system-messages.transaction-tracking.transaction-dropped"
        ),
        waitingForIndexing: t(
          "onboarding:create-system-messages.transaction-tracking.waiting-for-indexing"
        ),
        transactionIndexed: t(
          "onboarding:create-system-messages.transaction-tracking.transaction-indexed"
        ),
        indexingTimeout: t(
          "onboarding:create-system-messages.transaction-tracking.indexing-timeout"
        ),
        // useStreamingMutation messages (these are also passed to backend)
        initialLoading: t("onboarding:create-system-messages.initial-loading"),
        noResultError: t("onboarding:create-system-messages.no-result-error"),
        defaultError: t("onboarding:create-system-messages.default-error"),
      } satisfies SystemCreateMessages,
    },
  });
>>>>>>> origin

  return (
    <OnboardingGuard require="not-onboarded">
      <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
        {/* Application branding - top left corner */}
        <div className="absolute top-8 left-8 flex flex-col items-end gap-0">
          <div className={cn("flex w-full items-center gap-3")}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Logo variant="icon" forcedColorMode="dark" />
            </div>
            <div className="flex flex-col text-foreground leading-none">
              <span className="font-bold text-lg text-primary-foreground">
                SettleMint
              </span>
              <span className="-mt-1 overflow-hidden truncate text-ellipsis text-md text-sm leading-snug text-primary-foreground dark:text-foreground ">
                {t("general:appDescription")}
              </span>
            </div>
          </div>
        </div>
        {/* User controls - top right corner */}
        <div className="absolute top-8 right-8 flex gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
<<<<<<< HEAD
        {/* Centered content area with step wizard */}
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <StepWizard
              steps={steps}
              currentStepId={currentStepId}
              title={t("onboarding:card-title")}
              description={t("onboarding:card-description")}
              onStepChange={handleStepChange}
              showBackButton={false}
              showNextButton={false}
            >
              {renderStepContent()}
            </StepWizard>
          </div>
=======
        {/* Centered content area for auth forms */}
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-[90vw] lg:w-[75vw] !max-w-screen overflow-hidden">
            <CardHeader>
              <CardTitle>{t("onboarding:card-title")}</CardTitle>
              <CardDescription>
                {t("onboarding:card-description")}
              </CardDescription>
              <CardContent>
                <div className="flex flex-col gap-8">
                  <p>This should be our step wizard</p>
                  <Button
                    disabled={!!user?.wallet || !user?.id}
                    onClick={() => {
                      if (user?.id) {
                        generateWallet({
                          userId: user.id,
                          messages: {
                            walletCreated: t("onboarding:wallet-generated"),
                            walletAlreadyExists: t(
                              "onboarding:wallet-already-exists"
                            ),
                            walletCreationFailed: t(
                              "onboarding:wallet-creation-failed"
                            ),
                          },
                        });
                      }
                    }}
                  >
                    Generate a new wallet
                  </Button>
                  {/* <Button
                    disabled={!!user.wallet}
                    onClick={() => {
                      // generateWallet({ userId: user.id });
                    }}
                  >
                    Secure your wallet with MFA
                  </Button> */}
                  <Button
                    disabled={!!systemAddress || isCreatingSystem || isTracking}
                    onClick={() => {
                      createSystem({});
                    }}
                  >
                    {isCreatingSystem || isTracking
                      ? "Deploying..."
                      : "Deploy a new SMART system"}
                  </Button>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
>>>>>>> origin
        </div>
      </div>
    </OnboardingGuard>
  );
}
