import type { OnboardingStep } from "./state-machine";

interface OnboardingLayoutProps {
  currentStep: OnboardingStep;
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return <>{children}</>;
}
