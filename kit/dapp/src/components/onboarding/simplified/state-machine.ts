import type {
  OnboardingState,
  User,
} from "@/orpc/routes/user/routes/user.me.schema";
import { Derived, Store } from "@tanstack/react-store";

export enum OnboardingSteps {
  WALLET = "WALLET",
  SYSTEM = "SYSTEM",
  IDENTITY = "IDENTITY",
}

export const onboardingStateMachine = new Store<
  OnboardingState & { currentStep?: OnboardingSteps }
>({
  wallet: false,
  system: false,
  identity: false,
  currentStep: undefined,
});

export const initialStepsCache = new Store<OnboardingSteps[]>([]);

export const onboardingSteps = new Derived({
  fn: () => {
    const steps: OnboardingSteps[] = [];

    if (!onboardingStateMachine.state.wallet) {
      steps.push(OnboardingSteps.WALLET);
    }
    if (!onboardingStateMachine.state.system) {
      steps.push(OnboardingSteps.SYSTEM);
    }
    if (!onboardingStateMachine.state.identity) {
      steps.push(OnboardingSteps.IDENTITY);
    }

    const initialSteps = initialStepsCache.state;
    if (initialSteps.length === 0) {
      initialStepsCache.setState(steps);
    }

    return {
      steps,
      nextStep: steps[0],
      initialSteps,
      currentStep: onboardingStateMachine.state.currentStep,
    };
  },
  deps: [onboardingStateMachine, initialStepsCache],
});

onboardingSteps.mount();

export function updateOnboardingStateMachine(user: User) {
  onboardingStateMachine.setState((prev) => ({
    ...prev,
    ...user.onboardingState,
  }));
}

export function setCurrentStep(step: OnboardingSteps) {
  onboardingStateMachine.setState((prev) => ({
    ...prev,
    currentStep: step,
  }));
}
