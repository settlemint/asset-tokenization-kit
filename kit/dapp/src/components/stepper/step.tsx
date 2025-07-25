import { StepIndicator } from "@/components/onboarding/step-indicator";
import type {
  NavigationMode,
  Step,
  StepGroup,
} from "@/components/stepper/types";
import { isLastStepInGroup } from "@/components/stepper/utils";
import { cn } from "@/lib/utils";
import { isLastStep, isStepCompleted } from "./utils";

export interface StepItemProps<StepId, GroupId> {
  step: Step<StepId>;
  currentStep: Step<StepId>;
  allSteps: Step<StepId>[];
  navigation: NavigationMode;
  onStepSelect: (step: Step<StepId>) => void;
  group?: StepGroup<StepId, GroupId>;
}

export function StepComponent<StepId, GroupId>({
  step,
  currentStep,
  allSteps,
  navigation,
  onStepSelect,
  group,
}: StepItemProps<StepId, GroupId>) {
  const isCurrent = step.id === currentStep.id;
  const isCompleted = isStepCompleted({ step, currentStep });
  const isAccessible =
    isCurrent || (isCompleted && navigation === "next-and-completed");
  const isLast = group
    ? isLastStepInGroup(group, step)
    : isLastStep(allSteps, step);

  return (
    <div className="Step flex items-stretch mb-0 mt-2">
      {/* Dot column with line */}
      <div className="relative flex flex-col items-center w-12 pt-0">
        {/* The step dot */}
        <StepIndicator isCompleted={isCompleted} isCurrent={isCurrent} />

        {/* Connecting line (for all but last step) */}
        {!isLast && (
          <div
            className={cn(
              "w-0 border-l-2 border-dashed flex-grow transition-colors duration-300",
              isCompleted ? "border-white/60" : "border-white/30"
            )}
          />
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 flex items-center -mt-1 mb-4">
        <button
          type="button"
          className={cn(
            "flex flex-col w-full px-4 py-3 rounded-lg transition-all duration-200 text-left relative z-20 group",
            isCurrent && "bg-white/10 backdrop-blur-sm",
            !isAccessible && "cursor-not-allowed opacity-60",
            isAccessible && "hover:bg-white/15",
            isCompleted && !isCurrent && "cursor-pointer hover:bg-white/10"
          )}
          onClick={() => {
            if (isAccessible) {
              onStepSelect(step);
            }
          }}
          disabled={!isAccessible}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-sm transition-all duration-300",
                isCurrent
                  ? "font-bold text-primary-foreground"
                  : "font-medium text-primary-foreground/90"
              )}
            >
              {step.label}
            </span>
          </div>
          <p
            className={cn(
              "text-xs mt-1 transition-colors duration-300 leading-relaxed",
              isCurrent
                ? "text-primary-foreground/90"
                : "text-primary-foreground/70"
            )}
          >
            {step.description}
          </p>
        </button>
      </div>
    </div>
  );
}
