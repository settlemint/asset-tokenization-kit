import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Logo } from "@/components/logo/logo";
import { StepWizard } from "@/components/step-wizard/step-wizard";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authClient } from "@/lib/auth/auth.client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  component: AssetDesigner,
});

function AssetDesigner() {
  const { t } = useTranslation(["general"]);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // Start with first step, will update when data loads
  const [currentStepId, setCurrentStepId] = useState("type");
  const [hasInitialized, setHasInitialized] = useState(false);

  return (
    <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
      {/* Logo positioned in top-left - matching auth pages */}
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
      {/* Language and theme toggles positioned in top-right - matching auth pages */}
      <div className="absolute top-8 right-8 flex gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      {/* Centered content area with step wizard */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-6xl px-4">
          <StepWizard
            steps={[
              {
                id: "type",
                title: "Type",
                description: "Select the type of asset you want to create",
              },
              {
                id: "basics",
                title: "Basics",
                description: "Enter the basic details for your asset",
              },
              {
                id: "configuration",
                title: "Configuration",
                description: "Configure the price, tokenomics, and more",
              },
              {
                id: "permissions",
                title: "Permissions",
                description: "Setup permissions for your asset",
              },
              {
                id: "summary",
                title: "Summary",
                description: "Review the details and create your asset",
              },
            ]}
            currentStepId={currentStepId}
            title="Design your asset"
            description="Create digital assets with custom features, lifecycle management, and compliance settings"
            onStepChange={setCurrentStepId}
            onBack={() => {
              if (currentStepId === "basics") {
                setCurrentStepId("configuration");
              } else {
                setCurrentStepId("basics");
              }
            }}
            onNext={() => {
              if (currentStepId === "basics") {
                setCurrentStepId("configuration");
              } else {
                setCurrentStepId("basics");
              }
            }}
            isBackDisabled={false}
            isNextDisabled={false}
            nextLabel={"Next"}
            backLabel={"Back"}
          >
            <div>Basics</div>
            <div>Configuration</div>
          </StepWizard>
        </div>
      </div>
    </div>
  );
}
