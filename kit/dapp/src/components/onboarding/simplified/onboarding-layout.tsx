import { MultiStepWizard } from "@/components/multistep-form/multistep-wizard";
import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { OnboardingStep } from "@/components/onboarding/simplified/state-machine";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useCallback, useMemo, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const logger = createLogger();

const enum OnboardingStepGroup {
  wallet = "wallet",
  system = "system",
  identity = "identity",
}

type OnboardingStepDefintion = Omit<StepDefinition, "id"> & {
  id: OnboardingStep;
  groupId: OnboardingStepGroup;
};

export const OnboardingLayout: FunctionComponent<{
  children: React.ReactNode;
  currentStep: OnboardingStep;
}> = ({ children, currentStep }) => {
  const { t } = useTranslation(["onboarding", "general"]);

  const groups = useMemo((): StepGroup[] => {
    return [
      {
        id: OnboardingStepGroup.wallet,
        title: t("wallet.title"),
        description: t("wallet.description"),
        collapsible: true,
        defaultExpanded: currentStep === OnboardingStep.wallet,
      },
      {
        id: OnboardingStepGroup.system,
        title: t("system.title"),
        description: t("system.description"),
        collapsible: true,
        defaultExpanded: currentStep === OnboardingStep.system,
      },
      {
        id: OnboardingStepGroup.identity,
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
        collapsible: true,
        defaultExpanded: currentStep === OnboardingStep.identity,
      },
    ];
  }, [t, currentStep]);

  const steps = useMemo((): OnboardingStepDefintion[] => {
    const steps: OnboardingStepDefintion[] = [
      // Wallet steps
      {
        id: OnboardingStep.wallet,
        title: t("steps.wallet.title"),
        description: t("steps.wallet.description"),
        groupId: OnboardingStepGroup.wallet,
      },
      {
        id: OnboardingStep.walletSecurity,
        title: t("steps.security.title"),
        description: t("steps.security.description"),
        groupId: OnboardingStepGroup.wallet,
      },
      {
        id: OnboardingStep.walletRecoveryCodes,
        title: "Recovery Codes",
        description: "Save your wallet recovery codes",
        groupId: OnboardingStepGroup.wallet,
      },
      // 1. Deploy core system
      {
        id: OnboardingStep.system,
        title: t("steps.system.title"),
        description: t("steps.system.description"),
        groupId: OnboardingStepGroup.system,
      },
      /* TODO: implement these steps again
      // 2. Configure platform settings
      {
        id: "configure-platform-settings",
        title: t("platform.title"),
        description: t("platform.description"),
      },
      // 3. Select supported assets
      {
        id: "asset-selection",
        title: t("steps.assets.title"),
        description: t("steps.assets.description"),
        groupId: "system",
      },
      // 4. Enable platform addons
      {
        id: "enable-platform-addons",
        title: "Configure Platform Add-ons",
        description: "Enhance your platform with optional features",
        groupId: "system",
      },
      // 1. Create your ONCHAINID
      {
        id: "create-onchainid",
        title: "Create your ONCHAINID",
        description: "Generate your blockchain identity for compliance",
        groupId: "identity",
        fields: [],
        onStepComplete: async () => Promise.resolve(),
      },
      // 2. Add personal information
      {
        id: "add-personal-information",
        title: "Add personal information",
        description: "Provide KYC information for compliance verification",
        groupId: "identity",
      },
      // 3. Finish onboarding
      {
        id: "finish",
        title: "Finish",
        description: "Review and confirm your onboarding details",
        groupId: "identity",
      },
      */
    ];

    // Inject the children of the current step
    const activeStep = steps.find((step) => step.id === currentStep);
    if (activeStep) {
      activeStep.component = () => <>{children}</>;
    }

    return steps;
  }, [t, currentStep, children]);

  const defaultStepIndex = useMemo(() => {
    return steps.findIndex((step) => step.id === currentStep);
  }, [steps, currentStep]);

  const onComplete = useCallback(() => {
    logger.info("completed");
  }, []);

  return (
    <MultiStepWizard
      name="onboarding"
      title="Let's get you set up!"
      description="We'll set up your wallet and will configure your identity on the blockchain to use this platform."
      steps={steps}
      groups={groups}
      onComplete={onComplete}
      defaultStepIndex={defaultStepIndex}
    />
  );
};
