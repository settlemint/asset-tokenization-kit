import type {
  OnboardingState,
  User,
} from "@/orpc/routes/user/routes/user.me.schema";
import { Derived, Store } from "@tanstack/react-store";

export enum OnboardingStep {
  wallet = "wallet",
  system = "system",
  identity = "identity",
}

export const onboardingStateMachine = new Store<OnboardingState>({
  wallet: false,
  system: false,
  identity: false,
});

export const onboardingSteps = new Derived({
  fn: () => {
    const steps: {
      step: OnboardingStep;
      current: boolean;
      completed: boolean;
    }[] = [];

    steps.push({
      step: OnboardingStep.wallet,
      current: false,
      completed: onboardingStateMachine.state.wallet,
    });

    steps.push({
      step: OnboardingStep.system,
      current: false,
      completed: onboardingStateMachine.state.system,
    });

    steps.push({
      step: OnboardingStep.identity,
      current: false,
      completed: onboardingStateMachine.state.identity,
    });

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

export function updateOnboardingStateMachine({ user }: { user: User }) {
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
