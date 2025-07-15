import type {
  CurrentUser,
  OnboardingState,
} from "@/orpc/routes/user/routes/user.me.schema";
import { Derived, Store } from "@tanstack/react-store";
import type { useTranslation } from "react-i18next";

export const enum OnboardingStep {
  wallet = "wallet",
  walletSecurity = "wallet-security",
  walletRecoveryCodes = "wallet-recovery-codes",
  system = "system",
  identity = "identity",
}

export const enum OnboardingStepGroup {
  wallet = "wallet",
  system = "system",
  identity = "identity",
}

export const onboardingStateMachine = new Store<OnboardingState>({
  wallet: false,
  walletSecurity: false,
  walletRecoveryCodes: false,
  system: false,
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
        current: false,
        completed: onboardingStateMachine.state.wallet,
        titleTranslationKey: "steps.wallet.title",
        descriptionTranslationKey: "steps.wallet.description",
      },
      {
        step: OnboardingStep.walletSecurity,
        groupId: OnboardingStepGroup.wallet,
        current: false,
        completed: onboardingStateMachine.state.walletSecurity,
      },
      {
        step: OnboardingStep.walletRecoveryCodes,
        groupId: OnboardingStepGroup.wallet,
        current: false,
        completed: onboardingStateMachine.state.walletRecoveryCodes,
      },
      {
        step: OnboardingStep.system,
        groupId: OnboardingStepGroup.system,
        current: false,
        completed: onboardingStateMachine.state.system,
      },
      {
        step: OnboardingStep.identity,
        groupId: OnboardingStepGroup.identity,
        current: false,
        completed: onboardingStateMachine.state.identity,
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
  onboardingStateMachine.setState((prev) => ({
    ...prev,
    ...user.onboardingState,
  }));
  const currentStep = onboardingSteps.state.find((step) => step.current);
  return {
    currentStep: currentStep?.step ?? OnboardingStep.wallet,
    steps: onboardingSteps.state,
  };
}
