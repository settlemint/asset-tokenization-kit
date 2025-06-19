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
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { seo } from "@/config/metadata";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { cn } from "@/lib/utils";
import type { SystemCreateMessages } from "@/orpc/routes/system/routes/system.create.schema";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
function OnboardingComponent() {
  const { orpc } = Route.useRouteContext();
  const navigate = useNavigate();
  const { data: user, isError, error } = useQuery(orpc.user.me.queryOptions());
  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );
  const { sessionKey } = useContext(AuthQueryContext);
  const { t } = useTranslation(["onboarding", "general"]);
  const [, setSystemAddress] = useSettings("SYSTEM_ADDRESS");
  const [currentStepId, setCurrentStepId] = useState("wallet");

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
    },
  });

  // Define the onboarding steps
  const steps: Step[] = [
    {
      id: "wallet",
      title: "Create Wallet",
      description: "Generate a secure blockchain wallet for your account",
      status: user?.wallet
        ? "completed"
        : currentStepId === "wallet"
          ? "active"
          : "pending",
    },
    {
      id: "system",
      title: "Deploy System",
      description: "Deploy the SMART system contracts to the blockchain",
      status: systemAddress
        ? "completed"
        : currentStepId === "system"
          ? "active"
          : "pending",
    },
  ];

  const handleStepChange = (stepId: string) => {
    setCurrentStepId(stepId);
  };

  const renderStepContent = () => {
    switch (currentStepId) {
      case "wallet":
        return (
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Create Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Generate a secure blockchain wallet for your account
              </p>
            </div>
            <Button
              size="lg"
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
              className="w-fit"
            >
              {user?.wallet
                ? t("onboarding:wallet-already-exists")
                : "Generate Wallet"}
            </Button>
          </div>
        );

      case "system":
        return (
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Deploy System</h3>
              <p className="text-muted-foreground mb-6">
                Deploy the SMART system contracts to the blockchain
              </p>
            </div>
            <Button
              size="lg"
              disabled={!!systemAddress || isCreatingSystem || isTracking}
              onClick={() => {
                const messages: SystemCreateMessages = {
                  systemCreated: t(
                    "onboarding:create-system-messages.system-created"
                  ),
                  creatingSystem: t(
                    "onboarding:create-system-messages.creating-system"
                  ),
                  systemCreationFailed: t(
                    "onboarding:create-system-messages.system-creation-failed"
                  ),
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
                  initialLoading: t(
                    "onboarding:create-system-messages.initial-loading"
                  ),
                  noResultError: t(
                    "onboarding:create-system-messages.no-result-error"
                  ),
                  defaultError: t(
                    "onboarding:create-system-messages.default-error"
                  ),
                };
                createSystem({ messages });
              }}
              className="w-fit"
            >
              {isCreatingSystem || isTracking
                ? "Deploying..."
                : systemAddress
                  ? "System Already Deployed"
                  : "Deploy System"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

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
        </div>
      </div>
    </OnboardingGuard>
  );
}
