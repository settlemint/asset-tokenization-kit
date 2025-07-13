import type {
  OnboardingState,
  User,
} from "@/orpc/routes/user/routes/user.me.schema";
import { Derived, Store } from "@tanstack/react-store";

export enum OnboardingStep {
  welcome = "welcome",
  wallet = "wallet",
  system = "system",
  identity = "identity",
}

export const onboardingStateMachine = new Store<
  OnboardingState & { welcome: boolean }
>({
  welcome: false,
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
      step: OnboardingStep.welcome,
      current: false,
      completed: onboardingStateMachine.state.welcome,
    });

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

export function updateOnboardingStateMachine({
  user,
  welcome = true,
}: {
  user?: User;
  welcome?: boolean;
}) {
  onboardingStateMachine.setState((prev) => ({
    ...prev,
    ...user?.onboardingState,
    welcome,
  }));
}
