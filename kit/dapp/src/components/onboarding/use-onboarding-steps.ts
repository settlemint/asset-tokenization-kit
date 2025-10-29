import {
  OnboardingStep,
  OnboardingStepGroup,
} from "@/components/onboarding/state-machine";
import type { StepGroup } from "@/components/stepper/types";
import { useTranslation } from "react-i18next";

interface UseOnboardingStepsReturn {
  stepsOrGroups: StepGroup<OnboardingStep, OnboardingStepGroup>[];
}

export function useOnboardingSteps(): UseOnboardingStepsReturn {
  const { t } = useTranslation(["onboarding", "general"]);

  const stepsOrGroups = [
    {
      id: OnboardingStepGroup.wallet,
      label: t("groups.wallet.title"),
      description: t("groups.wallet.description"),
      steps: [
        {
          id: OnboardingStep.wallet,
          label: t("steps.wallet.title"),
          description: t("steps.wallet.description"),
          step: 1,
        },
        {
          id: OnboardingStep.walletSecurity,
          label: t("steps.wallet-security.title"),
          description: t("steps.wallet-security.description"),
          step: 2,
        },
        {
          id: OnboardingStep.walletRecoveryCodes,
          label: t("steps.wallet-recovery-codes.title"),
          description: t("steps.wallet-recovery-codes.description"),
          step: 3,
        },
      ],
    },
    {
      id: OnboardingStepGroup.system,
      label: t("groups.system.title"),
      description: t("groups.system.description"),
      steps: [
        {
          id: OnboardingStep.systemDeploy,
          label: t("steps.system-deploy.title"),
          description: t("steps.system-deploy.description"),
          step: 4,
        },
        {
          id: OnboardingStep.systemSettings,
          label: t("steps.system-settings.title"),
          description: t("steps.system-settings.description"),
          step: 5,
        },
        {
          id: OnboardingStep.systemAssets,
          label: t("steps.system-assets.title"),
          description: t("steps.system-assets.description"),
          step: 6,
        },
        {
          id: OnboardingStep.systemAddons,
          label: t("steps.system-addons.title"),
          description: t("steps.system-addons.description"),
          step: 7,
        },
      ],
    },
    {
      id: OnboardingStepGroup.identity,
      label: t("groups.identity.title"),
      description: t("groups.identity.description"),
      steps: [
        {
          id: OnboardingStep.identitySetup,
          label: t("steps.identity-setup.title"),
          description: t("steps.identity-setup.description"),
          step: 8,
        },
        {
          id: OnboardingStep.personal,
          label: t("steps.personal.title"),
          description: t("steps.personal.description"),
          step: 9,
        },
      ],
    },
  ] as const satisfies StepGroup<OnboardingStep, OnboardingStepGroup>[];

  return {
    stepsOrGroups,
  };
}
