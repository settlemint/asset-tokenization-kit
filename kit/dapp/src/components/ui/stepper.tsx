import { cn } from "@/lib/utils";

interface StepperProps {
  steps: number;
  currentStep: number;
  className?: string;
}

function Stepper({ steps, currentStep, className }: StepperProps) {
  const progress = ((currentStep + 1) / steps) * 100;

  return (
    <div
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps}
      aria-label={`Step ${currentStep + 1} of ${steps}`}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-primary-foreground/20 rounded-full" />

      {/* Progress fill */}
      <div
        className="bg-primary h-full transition-all duration-300 ease-in-out rounded-full"
        style={{ width: `${progress}%` }}
      />

      {/* Step indicators (invisible for visual consistency, but present for stepper functionality) */}
      <div className="absolute inset-0 flex items-center justify-between px-0">
        {Array.from({ length: steps }, (_, index) => (
          <div
            key={index}
            className="relative w-0 h-full"
            data-step={index + 1}
            data-active={index <= currentStep}
            data-current={index === currentStep}
          >
            {/* Invisible step indicator for stepper functionality */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 opacity-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { Stepper };
