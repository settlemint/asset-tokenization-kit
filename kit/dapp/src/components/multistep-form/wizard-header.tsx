import { WizardProgress } from "./wizard-progress";

interface WizardHeaderProps {
  name?: string;
  description?: string;
  currentStepIndex: number;
  totalSteps: number;
  showProgressBar: boolean;
}

/**
 * Wizard header component with title, description and progress
 */
export function WizardHeader({
  name,
  description,
  currentStepIndex,
  totalSteps,
  showProgressBar,
}: WizardHeaderProps) {
  // Derive formatted title from name
  const formattedTitle = name
    ? name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Setup Wizard";

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-primary-foreground mb-2">
        {formattedTitle}
      </h2>
      <p className="text-sm text-primary-foreground/90 leading-relaxed mb-4">
        {description ?? "Configure your platform step by step"}
      </p>

      <WizardProgress
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        showProgressBar={showProgressBar}
      />
    </div>
  );
}
