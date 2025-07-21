import {
  OnboardingStep,
  OnboardingStepGroup,
} from "@/components/onboarding/state-machine";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface OnboardingStepDefinition {
  step: OnboardingStep;
  groupId: OnboardingStepGroup;
  titleTranslationKey?: string;
  descriptionTranslationKey?: string;
  current: boolean;
  completed: boolean;
  title: string;
  description: string;
}

interface OnboardingGroup {
  id: string;
  title: string;
  description: string;
  collapsible: boolean;
  defaultExpanded: boolean;
}

interface UseOnboardingStepsReturn {
  stepsWithTranslations: OnboardingStepDefinition[];
  groups: OnboardingGroup[];
  currentStepIndex: number;
  progress: number;
  isGroupCompleted: (groupId: string) => boolean;
  getStepStatus: (
    step: OnboardingStepDefinition,
    index: number
  ) => "pending" | "active" | "completed" | "error";
  canNavigateToStep: (stepIndex: number) => boolean;
  groupedStepsByGroupId: Record<
    string,
    { step: OnboardingStepDefinition; index: number }[]
  >;
}

export function useOnboardingSteps(
  steps: {
    step: OnboardingStep;
    groupId: OnboardingStepGroup;
    current: boolean;
    completed: boolean;
  }[],
  currentStep: OnboardingStep
): UseOnboardingStepsReturn {
  const { t } = useTranslation(["onboarding", "general"]);

  // Step translation mappings
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
      [OnboardingStep.systemDeploy]: {
        title: "Deploy System",
        description: "Deploy the blockchain system",
      },
      [OnboardingStep.systemSettings]: {
        title: "Configure Settings",
        description: "Set up platform settings",
      },
      [OnboardingStep.systemAssets]: {
        title: "Select Assets",
        description: "Choose supported asset types",
      },
      [OnboardingStep.systemAddons]: {
        title: "Enable Addons",
        description: "Configure platform addons",
      },
      [OnboardingStep.identitySetup]: {
        title: t("steps.identity-setup.title"),
        description: t("steps.identity-setup.description"),
      },
      [OnboardingStep.identity]: {
        title: t("steps.identity.title"),
        description: t("steps.identity.description"),
      },
    }),
    [t]
  );

  // Group translation mappings
  const groupTranslationMappings = useMemo<
    Record<OnboardingStepGroup, { title: string; description: string }>
  >(
    () => ({
      [OnboardingStepGroup.wallet]: {
        title: t("groups.wallet.title"),
        description: t("groups.wallet.description"),
      },
      [OnboardingStepGroup.system]: {
        title: "Deploy SMART System",
        description: "Set up your blockchain platform",
      },
      [OnboardingStepGroup.identity]: {
        title: t("groups.identity.title"),
        description: t("groups.identity.description"),
      },
    }),
    [t]
  );

  // Create steps with translations
  const stepsWithTranslations = useMemo((): OnboardingStepDefinition[] => {
    return steps.map(
      (step): OnboardingStepDefinition => ({
        ...step,
        title: stepTranslationMappings[step.step].title,
        description: stepTranslationMappings[step.step].description,
      })
    );
  }, [steps, stepTranslationMappings]);

  // Find current step index
  const currentStepIndex = useMemo(() => {
    const index = stepsWithTranslations.findIndex(
      (step) => step.step === currentStep
    );
    return index >= 0 ? index : 0;
  }, [stepsWithTranslations, currentStep]);

  // Calculate progress
  const progress = useMemo(() => {
    if (stepsWithTranslations.length === 0) {
      return 0;
    }
    const currentProgress =
      ((currentStepIndex + 1) / stepsWithTranslations.length) * 100;
    return Math.round(currentProgress);
  }, [currentStepIndex, stepsWithTranslations.length]);

  // Create groups from steps
  const groups = useMemo(() => {
    return steps.reduce<OnboardingGroup[]>((acc, step) => {
      const existingGroup = acc.find(
        (group) => group.id === step.groupId.toString()
      );
      if (existingGroup) {
        existingGroup.defaultExpanded = currentStep === step.step;
      } else {
        acc.push({
          id: step.groupId,
          title: groupTranslationMappings[step.groupId].title,
          description: groupTranslationMappings[step.groupId].description,
          collapsible: true,
          defaultExpanded: currentStep === step.step,
        });
      }
      return acc;
    }, []);
  }, [steps, groupTranslationMappings, currentStep]);

  // Group steps by their groupId
  const groupedStepsByGroupId = useMemo(() => {
    return stepsWithTranslations.reduce(
      (acc, step, index) => {
        const groupId = step.groupId;
        acc[groupId] ??= [];
        acc[groupId].push({ step, index });
        return acc;
      },
      {} as Record<string, { step: OnboardingStepDefinition; index: number }[]>
    );
  }, [stepsWithTranslations]);

  // Helper function to check if all steps in a group are completed
  const isGroupCompleted = useCallback(
    (groupId: string) => {
      const groupSteps = stepsWithTranslations.filter(
        (step) => String(step.groupId) === String(groupId)
      );
      return groupSteps.every(
        (step) =>
          step.completed ||
          stepsWithTranslations.findIndex((s) => s.step === step.step) <
            currentStepIndex
      );
    },
    [stepsWithTranslations, currentStepIndex]
  );

  // Get step status
  const getStepStatus = useCallback(
    (
      step: OnboardingStepDefinition,
      index: number
    ): "pending" | "active" | "completed" | "error" => {
      if (step.completed || index < currentStepIndex) {
        return "completed";
      }
      if (index === currentStepIndex) {
        return "active";
      }
      return "pending";
    },
    [currentStepIndex]
  );

  // Check if step is accessible
  const canNavigateToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= stepsWithTranslations.length) {
        return false;
      }
      if (stepIndex === currentStepIndex) {
        return true;
      }
      // Allow navigation to previous steps or completed steps
      const targetStep = stepsWithTranslations[stepIndex];
      if (!targetStep) {
        return false;
      }
      return stepIndex < currentStepIndex || targetStep.completed;
    },
    [stepsWithTranslations, currentStepIndex]
  );

  return {
    stepsWithTranslations,
    groups,
    currentStepIndex,
    progress,
    isGroupCompleted,
    getStepStatus,
    canNavigateToStep,
    groupedStepsByGroupId,
  };
}
