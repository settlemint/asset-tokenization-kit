import type {
  CurrentUser,
  OnboardingState,
} from "@/orpc/routes/user/routes/user.me.schema";
import { Derived, Store } from "@tanstack/react-store";

interface OnboardingStateMachine extends OnboardingState {
  isAdmin: boolean;
}

export enum OnboardingStep {
  wallet = "wallet",
  walletSecurity = "wallet-security",
  walletRecoveryCodes = "wallet-recovery-codes",
  systemDeploy = "system-deploy",
  systemSettings = "system-settings",
  systemAssets = "system-assets",
  systemAddons = "system-addons",
  identitySetup = "identity-setup",
  personal = "personal",
}

export const enum OnboardingStepGroup {
  wallet = "wallet",
  system = "system",
  identity = "identity",
}

export const onboardingStateMachine = new Store<OnboardingStateMachine>({
  isAdmin: false,
  wallet: false,
  walletSecurity: false,
  walletRecoveryCodes: false,
  system: false,
  systemSettings: false,
  systemAssets: false,
  systemAddons: false,
  identitySetup: false,
  personal: false,
});

export const onboardingSteps = new Derived({
  fn: () => {
    const steps: {
      step: OnboardingStep;
      groupId: OnboardingStepGroup;
      current: boolean;
      completed: boolean;
    }[] = [
      {
        step: OnboardingStep.wallet,
        groupId: OnboardingStepGroup.wallet,
        current: false,
        completed: onboardingStateMachine.state.wallet,
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
      ...(onboardingStateMachine.state.isAdmin
        ? [
            {
              step: OnboardingStep.systemDeploy,
              groupId: OnboardingStepGroup.system,
              current: false,
              completed: onboardingStateMachine.state.system,
            },
            {
              step: OnboardingStep.systemSettings,
              groupId: OnboardingStepGroup.system,
              current: false,
              completed: onboardingStateMachine.state.systemSettings,
            },
            {
              step: OnboardingStep.systemAssets,
              groupId: OnboardingStepGroup.system,
              current: false,
              completed: onboardingStateMachine.state.systemAssets,
            },
            {
              step: OnboardingStep.systemAddons,
              groupId: OnboardingStepGroup.system,
              current: false,
              completed: onboardingStateMachine.state.systemAddons,
            },
          ]
        : []),
      {
        step: OnboardingStep.identitySetup,
        groupId: OnboardingStepGroup.identity,
        current: false,
        completed: onboardingStateMachine.state.identitySetup,
      },
      {
        step: OnboardingStep.personal,
        groupId: OnboardingStepGroup.identity,
        current: false,
        completed: onboardingStateMachine.state.personal,
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
    isAdmin: user.role === "admin",
  }));

  return {
    currentStep:
      onboardingSteps.state.find((step) => step.current)?.step ??
      OnboardingStep.wallet,
    steps: onboardingSteps.state,
  };
}
