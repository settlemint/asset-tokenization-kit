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

import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/query.client";
import { cn } from "@/lib/utils";
import { orpc } from "@/orpc";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute("/_private/onboarding")({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(orpc.user.me.queryOptions());
    void context.queryClient.prefetchQuery(orpc.account.me.queryOptions());
    void context.queryClient.prefetchQuery(
      orpc.settings.read.queryOptions({
        input: {
          key: "SYSTEM_ADDRESS",
        },
      })
    );
  },
  component: OnboardingComponent,
});

function OnboardingComponent() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());
  const { sessionKey } = useContext(AuthQueryContext);
  const { data: systemAddress } = useSuspenseQuery(
    orpc.settings.read.queryOptions({
      input: {
        key: "SYSTEM_ADDRESS",
      },
    })
  );
  const [systemTxHash, setSystemTxHash] = useState<string | undefined>();

  const { mutate: generateWallet } = useMutation(
    orpc.account.create.mutationOptions({
      onSuccess: () => {
        toast.success("Wallet generated");
        void queryClient.invalidateQueries({
          queryKey: sessionKey,
          refetchType: "all",
        });
        void queryClient.invalidateQueries({
          queryKey: orpc.user.me.queryKey(),
          refetchType: "all",
        });
      },
    })
  );

  const { mutate: createSystem, isPending: isCreatingSystem } = useMutation(
    orpc.system.create.mutationOptions({
      onSuccess: (data) => {
        setSystemTxHash(data);
      },
      onError: (error) => {
        toast.error(`Failed to create system: ${error.message}`);
      },
    })
  );

  // Use streamedOptions for transaction tracking
  const { data: trackingData } = useQuery(
    orpc.transaction.track.experimental_streamedOptions({
      input: {
        transactionHash: systemTxHash ?? "",
        messages: {
          transaction: {
            pending: "Deploying SMART system on blockchain...",
            dropped: "Transaction was dropped from the network",
          },
          indexing: {
            pending: "Indexing smart contracts...",
            success: "SMART system deployed successfully!",
            timeout: "Indexing is taking longer than expected",
          },
        },
      },
      enabled: !!systemTxHash,
    })
  );

  // Get the latest tracking status from streamed data
  const trackingStatus = trackingData?.[trackingData.length - 1] ?? null;
  const isTracking =
    !!systemTxHash &&
    trackingStatus?.status !== "confirmed" &&
    trackingStatus?.status !== "failed";

  // Handle tracking completion
  useEffect(() => {
    if (!trackingStatus) return;

    if (trackingStatus.status === "confirmed") {
      toast.success("SMART system deployed successfully!");
      void queryClient.invalidateQueries({
        queryKey: orpc.settings.read.queryKey({
          input: { key: "SYSTEM_ADDRESS" },
        }),
      });
    } else if (trackingStatus.status === "failed") {
      toast.error(`System deployment failed: ${trackingStatus.reason}`);
      setSystemTxHash(undefined);
    }
  }, [trackingStatus]);

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
                    disabled={!!user.wallet}
                    onClick={() => {
                      generateWallet({ userId: user.id });
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
                  <div className="flex flex-col gap-4">
                    <Button
                      disabled={
                        !!systemAddress || isCreatingSystem || isTracking
                      }
                      onClick={() => {
                        createSystem({});
                      }}
                    >
                      {isCreatingSystem || isTracking
                        ? "Deploying..."
                        : "Deploy a new SMART system"}
                    </Button>
                    {(isCreatingSystem || isTracking) && trackingStatus && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {trackingStatus.status === "failed"
                              ? trackingStatus.reason
                              : trackingStatus.message}
                          </span>
                          {trackingStatus.status === "pending" && (
                            <span className="text-xs text-muted-foreground animate-pulse">
                              Processing...
                            </span>
                          )}
                        </div>
                        <Progress
                          value={
                            trackingStatus.status === "pending" &&
                            trackingStatus.message.includes("Indexing")
                              ? 66
                              : trackingStatus.status === "confirmed"
                                ? 100
                                : trackingStatus.status === "failed"
                                  ? 0
                                  : 33
                          }
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      </div>
    </OnboardingGuard>
  );
}
