import { MultiStepWizard } from "@/components/multistep-form/multistep-wizard";
import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import {
  OnboardingStep,
  OnboardingStepGroup,
  onboardingSteps,
} from "@/components/onboarding/state-machine";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useStore } from "@tanstack/react-store";
import { useCallback, useMemo, type FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const logger = createLogger();

type OnboardingStepDefintion = Omit<StepDefinition, "id"> & {
  id: OnboardingStep;
  groupId: OnboardingStepGroup;
};

export const OnboardingLayout: FunctionComponent<{
  children: React.ReactNode;
  currentStep: OnboardingStep;
}> = ({ children, currentStep }) => {
  const { t } = useTranslation(["onboarding", "general"]);
  const steps = useStore(onboardingSteps, (state) => state);

  const stepTranslationMappings = useMemo<
    Record<OnboardingStep, { title: string; description: string }>
  >(
    () => ({
      [OnboardingStep.wallet]: {
        title: t("steps.wallet.title"),
        description: t("steps.wallet.description"),
      },
      [OnboardingStep.walletSecurity]: {
        title: t("steps.security.title"),
        description: t("steps.security.description"),
      },
      [OnboardingStep.walletRecoveryCodes]: {
        title: "Recovery Codes",
        description: "Save your wallet recovery codes",
      },
      [OnboardingStep.system]: {
        title: t("steps.system.title"),
        description: t("steps.system.description"),
      },
      [OnboardingStep.identity]: {
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
      },
    }),
    [t]
  );

  const groupTranslationMappings = useMemo<
    Record<OnboardingStepGroup, { title: string; description: string }>
  >(
    () => ({
      [OnboardingStepGroup.wallet]: {
        title: t("wallet.title"),
        description: t("wallet.description"),
      },
      [OnboardingStepGroup.system]: {
        title: t("system.title"),
        description: t("system.description"),
      },
      [OnboardingStepGroup.identity]: {
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
      },
    }),
    [t]
  );

  const groups = useMemo((): StepGroup[] => {
    return steps.reduce<StepGroup[]>((acc, step) => {
      const existingGroup = acc.find(
        (group) => group.id === step.groupId.toString()
      );
      if (!existingGroup) {
        acc.push({
          id: step.groupId,
          title: groupTranslationMappings[step.groupId].title,
          description: groupTranslationMappings[step.groupId].description,
          collapsible: true,
          defaultExpanded: currentStep === step.step,
        });
      } else {
        existingGroup.defaultExpanded = currentStep === step.step;
      }
      return acc;
    }, []);
  }, [steps, groupTranslationMappings, currentStep]);

  const stepsWithTranslations = useMemo((): OnboardingStepDefintion[] => {
    const withTranslations = steps.map(
      (step): OnboardingStepDefintion => ({
        ...step,
        id: step.step,
        title: stepTranslationMappings[step.step].title,
        description: stepTranslationMappings[step.step].description,
      })
    );

    // Inject the children of the current step
    const activeStep = withTranslations.find((step) => step.id === currentStep);
    if (activeStep) {
      activeStep.component = () => <>{children}</>;
    }

    return withTranslations;
  }, [currentStep, children, steps, stepTranslationMappings]);

  const defaultStepIndex = useMemo(() => {
    return stepsWithTranslations.findIndex((step) => step.id === currentStep);
  }, [stepsWithTranslations, currentStep]);

  const onComplete = useCallback(() => {
    logger.info("completed");
  }, []);

  return (
    <MultiStepWizard
      name="onboarding"
      title="Let's get you set up!"
      description="We'll set up your wallet and will configure your identity on the blockchain to use this platform."
      steps={stepsWithTranslations}
      groups={groups}
      onComplete={onComplete}
      defaultStepIndex={defaultStepIndex}
    />
  );
};
