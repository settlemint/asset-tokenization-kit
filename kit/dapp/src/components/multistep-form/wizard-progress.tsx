import { Progress } from "@/components/ui/progress";

interface WizardProgressProps {
  currentStepIndex: number;
  totalSteps: number;
  showProgressBar: boolean;
}

/**
 * Wizard progress component showing step count and progress bar
 */
export function WizardProgress({
  currentStepIndex,
  totalSteps,
  showProgressBar,
}: WizardProgressProps) {
  if (!showProgressBar) {
    return null;
  }

  // Derive progress from current step
  const progress =
    totalSteps === 0
      ? 0
      : Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div>
      <div className="flex justify-between text-xs text-primary-foreground/80 mb-2">
        <span>Step {currentStepIndex + 1}</span>
        <span>
          {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>
      <Progress value={progress} className="h-2 bg-primary-foreground/20" />
    </div>
  );
}
