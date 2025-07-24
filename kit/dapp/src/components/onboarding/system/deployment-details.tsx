import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

export function DeploymentDetails() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const [showDetails, setShowDetails] = useState(false);

  // Query system details
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: "default" },
    }),
  });

  const toggleDetails = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  if (!systemDetails) {
    return null;
  }

  return (
    <OnboardingStepLayout
      title={t("system.deployment-details-title")}
      description={t("system.deployment-details-description")}
      actions={
        <Button
          onClick={() =>
            void completeStepAndNavigate(OnboardingStep.systemSettings)
          }
        >
          {t("common:continue")}
        </Button>
      }
    >
      <Button
        variant="outline"
        onClick={toggleDetails}
        className="w-full justify-between"
      >
        <span>{t("system.view-deployment-details")}</span>
        {showDetails ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {showDetails && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-foreground mb-3">
            {t("system.deployed-contracts")}
          </h4>

          <div className="space-y-3">
            {/* System Contract */}
            <div className="p-3 bg-background rounded border">
              <p className="font-medium text-sm mb-1">
                {t("system.system-contract")}
              </p>
              <Web3Address
                address={systemDetails.id}
                copyToClipboard
                showFullAddress={false}
                showBadge={false}
                size="small"
                className="text-xs text-muted-foreground"
              />
            </div>

            {/* Identity Registry */}
            {systemDetails.identityRegistry && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">
                  {t("system.identity-registry-label")}
                </p>
                <Web3Address
                  address={systemDetails.identityRegistry}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}

            {/* Compliance Engine */}
            {systemDetails.compliance && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">
                  {t("system.compliance-engine-label")}
                </p>
                <Web3Address
                  address={systemDetails.compliance}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}

            {/* Trusted Issuers Registry */}
            {systemDetails.trustedIssuersRegistry && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">
                  {t("system.trusted-issuers-label")}
                </p>
                <Web3Address
                  address={systemDetails.trustedIssuersRegistry}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}

            {/* Token Factory Registry */}
            {systemDetails.tokenFactoryRegistry && (
              <div className="p-3 bg-background rounded border">
                <p className="font-medium text-sm mb-1">
                  {t("system.token-factory-label")}
                </p>
                <Web3Address
                  address={systemDetails.tokenFactoryRegistry}
                  copyToClipboard
                  showFullAddress={false}
                  showBadge={false}
                  size="small"
                  className="text-xs text-muted-foreground"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </OnboardingStepLayout>
  );
}
