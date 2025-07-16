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
  wallet: false,
  walletSecurity: false,
  walletRecoveryCodes: false,
  system: false,
  identity: false,
});

type TranslationKey = Parameters<
  ReturnType<typeof useTranslation<readonly ["onboarding"]>>["t"]
>[0];

export function buildOnboardingSteps(user: CurrentUser, hasSystem: boolean) {
  const onboardingState = user.onboardingState;

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
      completed: onboardingState.wallet,
      titleTranslationKey: "steps.wallet.title",
      descriptionTranslationKey: "steps.wallet.description",
    },
    {
      step: OnboardingStep.walletSecurity,
      groupId: OnboardingStepGroup.wallet,
      current: false,
      completed: onboardingState.walletSecurity,
    },
    {
      step: OnboardingStep.walletRecoveryCodes,
      groupId: OnboardingStepGroup.wallet,
      current: false,
      completed: onboardingState.walletRecoveryCodes,
    },
  ];

  // Show system steps if user is admin (always show them, but with proper completion states)
  if (user.role === "admin") {
    // hasSystem now checks both SYSTEM_ADDRESS exists AND SYSTEM_BOOTSTRAP_COMPLETE is "true"
    // This ensures system deploy step is only marked complete when fully bootstrapped
    // Other steps are still not individually tracked and need manual completion

    steps.push(
      {
        step: OnboardingStep.systemDeploy,
        groupId: OnboardingStepGroup.system,
        current: false,
        completed: hasSystem, // Complete when system is deployed AND bootstrapped
      },
      {
        step: OnboardingStep.systemSettings,
        groupId: OnboardingStepGroup.system,
        current: false,
        completed: false, // TODO: Add individual step tracking
      },
      {
        step: OnboardingStep.systemAssets,
        groupId: OnboardingStepGroup.system,
        current: false,
        completed: false, // TODO: Add individual step tracking
      },
      {
        step: OnboardingStep.systemAddons,
        groupId: OnboardingStepGroup.system,
        current: false,
        completed: false, // TODO: Add individual step tracking
      }
    );
  }

  steps.push({
    step: OnboardingStep.identity,
    groupId: OnboardingStepGroup.identity,
    current: false,
    completed: onboardingState.identity,
  });

  // the current step should be true for the first step that is not completed
  const currentStep = steps.find((step) => !step.completed);
  if (currentStep) {
    currentStep.current = true;
  }

  return steps;
}

let currentUser: CurrentUser | null = null;
let currentHasSystem = false;

export const onboardingSteps = new Derived({
  fn: () => {
    if (!currentUser) return [];
    return buildOnboardingSteps(currentUser, currentHasSystem);
  },
  deps: [onboardingStateMachine],
});

onboardingSteps.mount();

export function updateOnboardingStateMachine({
  user,
  hasSystem = false,
}: {
  user: CurrentUser;
  hasSystem?: boolean;
}) {
  const onboardingState = user.onboardingState;

  // Update the global state for the store
  currentUser = user;
  currentHasSystem = hasSystem;

  onboardingStateMachine.setState((prev) => ({
    ...prev,
    wallet: onboardingState.wallet,
    walletSecurity: onboardingState.walletSecurity,
    walletRecoveryCodes: onboardingState.walletRecoveryCodes,
    system: onboardingState.system,
    identity: onboardingState.identity,
  }));

  const steps = buildOnboardingSteps(user, hasSystem);
  const currentStep = steps.find((step) => step.current);

  return {
    currentStep: currentStep?.step ?? OnboardingStep.wallet,
    steps,
  };
}
