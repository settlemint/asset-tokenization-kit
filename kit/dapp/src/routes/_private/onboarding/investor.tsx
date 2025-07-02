import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";
import { WalletStep } from "@/components/onboarding/steps/wallet-step";
import { StepWizard, type Step } from "@/components/step-wizard/step-wizard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth.client";
import type { OnboardingType } from "@/lib/types/onboarding";
import { orpc } from "@/orpc";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, UserCheck } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/investor")({
  loader: async ({ context }) => {
    // User data is critical for determining step status
    const user = await context.queryClient.ensureQueryData(
      orpc.user.me.queryOptions()
    );
    return { user };
  },
  component: InvestorOnboarding,
});

// Placeholder component for identity verification
/**
 *
 * @param root0
 * @param root0.onSuccess
 */
function IdentityStep({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation(["onboarding", "general"]);

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sm-state-warning-background/20">
          <UserCheck className="h-6 w-6 text-sm-state-warning-background" />
        </div>
        <CardTitle>{t("steps.identity.title")}</CardTitle>
        <CardDescription>{t("steps.identity.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            {t("steps.identity.info")}
          </p>
        </div>

        <div className="rounded-lg border border-sm-state-warning-background/30 bg-sm-state-warning-background/10 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-sm-state-warning-background" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-sm-text">
                {t("steps.identity.coming-soon")}
              </h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>{t("steps.identity.coming-soon-description")}</p>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={onSuccess} className="w-full">
          {t("general:continue")}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 *
 */
function InvestorOnboarding() {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const [currentStepId, setCurrentStepId] = useState("wallet");
  const { data: session } = authClient.useSession();

  // Define steps with dynamic statuses
  const steps: Step[] = useMemo(
    () => [
      {
        id: "wallet",
        title: t("steps.wallet.title"),
        description: t("steps.wallet.description"),
        status: currentStepId === "wallet" ? "active" : "completed",
      },
      {
        id: "security",
        title: t("steps.security.title"),
        description: t("steps.security.description"),
        status: session?.user.pincodeEnabled
          ? "completed"
          : currentStepId === "security"
            ? "active"
            : "pending",
      },
      {
        id: "identity",
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
        status: currentStepId === "identity" ? "active" : "pending",
      },
    ],
    [currentStepId, session?.user.pincodeEnabled, t]
  );

  const handleStepChange = useCallback((stepId: string) => {
    setCurrentStepId(stepId);
  }, []);

  const handleWalletSuccess = useCallback(() => {
    setCurrentStepId("security");
  }, []);

  const handleSecuritySuccess = useCallback(() => {
    setCurrentStepId("identity");
  }, []);

  const handleIdentitySuccess = useCallback(() => {
    // Investor onboarding complete, redirect to dashboard
    void navigate({ to: "/" });
  }, [navigate]);

  const allowedTypes: OnboardingType[] = useMemo(() => ["investor"], []);

  return (
    <OnboardingGuard require="not-onboarded" allowedTypes={allowedTypes}>
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <StepWizard
            steps={steps}
            currentStepId={currentStepId}
            title={t("investor.title")}
            description={t("investor.description")}
            onStepChange={handleStepChange}
          >
            {currentStepId === "wallet" && (
              <WalletStep onSuccess={handleWalletSuccess} />
            )}
            {currentStepId === "security" && (
              <WalletSecurityStep onSuccess={handleSecuritySuccess} />
            )}
            {currentStepId === "identity" && (
              <IdentityStep onSuccess={handleIdentitySuccess} />
            )}
          </StepWizard>
        </div>
      </div>
    </OnboardingGuard>
  );
}
