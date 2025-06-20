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
import { AssetSelectionStep } from "@/components/onboarding/steps/asset-selection-step";
import { SystemDeploymentStep } from "@/components/onboarding/steps/system-deployment-step";
import { WalletGenerationStep } from "@/components/onboarding/steps/wallet-generation-step";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { seo } from "@/config/metadata";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
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
  const { t } = useTranslation(["onboarding", "general"]);

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
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Step 1: Generate Wallet
                    </h3>
                    <WalletGenerationStep />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Step 2: Deploy System
                    </h3>
                    <SystemDeploymentStep />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Step 3: Select Asset Types
                    </h3>
                    <AssetSelectionStep />
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
