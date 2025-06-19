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
import { seo } from "@/config/metadata";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { authClient } from "@/lib/auth/auth.client";
import { queryClient } from "@/lib/query.client";
import { cn } from "@/lib/utils";
import { AuthQueryContext } from "@daveyplate/better-auth-tanstack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
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
    })
  );

  const {
    mutate: createSystem,
    isPending: isCreatingSystem,
    isTracking,
  } = useStreamingMutation<`0x${string}`, Error, { contract?: string }>({
    mutationOptions: orpc.system.create.mutationOptions(),
    errorMessage: t("onboarding:messages.error"),
  });

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
                    disabled={!!user?.wallet || !user?.id}
                    onClick={() => {
                      if (user?.id) {
                        generateWallet({ userId: user.id });
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
                      createSystem(
                        {},
                        {
                          onSuccess: (address) => {
                            setSystemAddress(address);
                          },
                        }
                      );
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
        </div>
      </div>
    </OnboardingGuard>
  );
}
