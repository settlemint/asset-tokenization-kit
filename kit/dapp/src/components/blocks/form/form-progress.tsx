import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Props shared by all step components
 */
interface StepProps {
  /** Whether this is the last step in the sequence */
  isLastStep?: boolean;
  /** The total number of steps */
  totalSteps: number;
  /** The index of this step */
  index: number;
}

/**
 * Common styles for the step circle container
 */
const stepCircleStyles =
  "flex aspect-square w-8 items-center justify-center rounded-full border-2";

/**
 * Common styles for the connecting line between steps
 */
const stepLineStyles = "h-0.5 grow";

/**
 * Renders a completed step with a checkmark
 */
const CompletedStep = ({
  isLastStep = false,
}: Pick<StepProps, "isLastStep">) => {
  const t = useTranslations("components.form.progress");

  return (
    <>
      <div
        className={cn(
          stepCircleStyles,
          "border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))]"
        )}
        aria-label={t("completed-step")}
      >
        <Check className="h-4 w-4 text-[hsl(var(--background))]" />
      </div>
      {!isLastStep && (
        <div
          className={cn(stepLineStyles, "bg-[hsl(var(--foreground))]")}
          role="presentation"
        />
      )}
    </>
  );
};

/**
 * Renders the current active step
 */
const CurrentStep = ({
  index,
  totalSteps,
}: Pick<StepProps, "index" | "totalSteps">) => {
  const t = useTranslations("components.form.progress");

  return (
    <>
      <div
        className={cn(
          stepCircleStyles,
          "border-[hsl(var(--foreground))] bg-transparent"
        )}
        aria-label={t("current-step")}
        aria-current="step"
      >
        <Circle className="h-3 w-3 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--foreground))]" />
      </div>
      {index + 1 < totalSteps && (
        <div
          className={cn(stepLineStyles, "bg-[hsl(var(--input))]")}
          role="presentation"
        />
      )}
    </>
  );
};

/**
 * Renders an upcoming step that hasn't been completed yet
 */
const NextStep = ({
  index,
  totalSteps,
}: Pick<StepProps, "index" | "totalSteps">) => {
  const t = useTranslations("components.form.progress");

  return (
    <>
      <div
        className={cn(
          stepCircleStyles,
          "border-[hsl(var(--input))] bg-transparent"
        )}
        aria-label={t("upcoming-step")}
      >
        <div className="h-3 w-3 rounded-full border-2 border-[hsl(var(--input))]" />
      </div>
      {index + 1 < totalSteps && (
        <div
          className={cn(stepLineStyles, "bg-[hsl(var(--input))]")}
          role="presentation"
        />
      )}
    </>
  );
};

interface FormProgressProps {
  /** The current active step (0-based index) */
  currentStep: number;
  /** The total number of steps in the form */
  totalSteps: number;
}

/**
 * Displays a progress indicator for multi-step forms
 * Shows completed steps with checkmarks, the current step with a filled circle,
 * and upcoming steps with empty circles
 */
export function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  const t = useTranslations("components.form.progress");

  if (totalSteps < 2) {
    return null;
  }
  return (
    <output
      className="mb-8 flex items-center"
      aria-label={t("step-of-total", {
        current: currentStep + 1,
        total: totalSteps,
      })}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const props = {
          index,
          totalSteps,
          isLastStep: index === totalSteps - 1,
        };

        if (index < currentStep) {
          return <CompletedStep key={index} isLastStep={props.isLastStep} />;
        }
        if (index === currentStep) {
          return (
            <CurrentStep
              key={index}
              index={props.index}
              totalSteps={props.totalSteps}
            />
          );
        }
        return (
          <NextStep
            key={index}
            index={props.index}
            totalSteps={props.totalSteps}
          />
        );
      })}
    </output>
  );
}
