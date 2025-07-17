import type {
  CurrentUser,
  OnboardingState,
} from "@/orpc/routes/user/routes/user.me.schema";
import { Derived, Store } from "@tanstack/react-store";
import type { useTranslation } from "react-i18next";

export enum OnboardingStep {
  wallet = "wallet",
  walletSecurity = "wallet-security",
  walletRecoveryCodes = "wallet-recovery-codes",
  systemDeploy = "system-deploy",
  systemSettings = "system-settings",
  systemAssets = "system-assets",
  systemAddons = "system-addons",
  identity = "identity",
}

export const enum OnboardingStepGroup {
  wallet = "wallet",
  system = "system",
  identity = "identity",
}

export const onboardingStateMachine = new Store<OnboardingState>({
  isAdmin: false,
  wallet: false,
  walletSecurity: false,
  walletRecoveryCodes: false,
  system: false,
  systemSettings: false,
  identity: false,
});

type TranslationKey = Parameters<
  ReturnType<typeof useTranslation<readonly ["onboarding"]>>["t"]
>[0];

export const onboardingSteps = new Derived({
  fn: () => {
    const steps: {
      step: OnboardingStep;
      groupId: OnboardingStepGroup;
      titleTranslationKey?: TranslationKey;
      descriptionTranslationKey?: TranslationKey;
      current: boolean;
      completed: boolean;
    }[] = [
      {
        step: OnboardingStep.wallet,
        groupId: OnboardingStepGroup.wallet,
        titleTranslationKey: "steps.wallet.title",
        descriptionTranslationKey: "steps.wallet.description",
        current: false,
        completed: onboardingStateMachine.state.wallet,
      },
      {
        step: OnboardingStep.walletSecurity,
        groupId: OnboardingStepGroup.wallet,
        titleTranslationKey: "steps.security.title",
        descriptionTranslationKey: "steps.security.description",
        current: false,
        completed: onboardingStateMachine.state.walletSecurity,
      },
      {
        step: OnboardingStep.walletRecoveryCodes,
        groupId: OnboardingStepGroup.wallet,
        titleTranslationKey: "steps.walletRecoveryCodes.title",
        descriptionTranslationKey: "steps.walletRecoveryCodes.description",
        current: false,
        completed: onboardingStateMachine.state.walletRecoveryCodes,
      },
      {
        step: OnboardingStep.systemDeploy,
        groupId: OnboardingStepGroup.system,
        titleTranslationKey: "steps.system.title",
        descriptionTranslationKey: "steps.system.description",
        current: false,
        completed: onboardingStateMachine.state.system,
      },
      {
        step: OnboardingStep.systemSettings,
        groupId: OnboardingStepGroup.system,
        titleTranslationKey: "steps.systemSettings.title",
        descriptionTranslationKey: "steps.systemSettings.description",
        current: false,
        completed: onboardingStateMachine.state.systemSettings,
      },
      {
        step: OnboardingStep.systemAssets,
        groupId: OnboardingStepGroup.system,
        titleTranslationKey: "steps.assets.title",
        descriptionTranslationKey: "steps.assets.description",
        current: false,
        completed: false, // This step is dynamic based on factory deployment status
      },
      {
        step: OnboardingStep.systemAddons,
        groupId: OnboardingStepGroup.system,
        titleTranslationKey: "steps.systemAddons.title",
        descriptionTranslationKey: "steps.systemAddons.description",
        current: false,
        completed: false, // This step is optional, can be skipped
      },
      {
        step: OnboardingStep.identity,
        groupId: OnboardingStepGroup.identity,
        titleTranslationKey: "steps.identity.title",
        descriptionTranslationKey: "steps.identity.description",
        current: false,
        completed: onboardingStateMachine.state.identity,
      },
    ];

    // the current step should be true for the first step that is not completed
    const currentStep = steps.find((step) => !step.completed);
    if (currentStep) {
      currentStep.current = true;
    }

    return steps;
  },
  deps: [onboardingStateMachine],
});

onboardingSteps.mount();

export function updateOnboardingStateMachine({ user }: { user: CurrentUser }) {
  const onboardingState = user.onboardingState;

  onboardingStateMachine.setState((prev) => ({
    ...prev,
    ...onboardingState,
  }));

  return {
    currentStep:
      onboardingSteps.state.find((step) => step.current)?.step ??
      OnboardingStep.wallet,
    steps: onboardingSteps.state,
  };
}
