import { Check, Circle } from 'lucide-react';

const CompletedStep = ({ isLastStep = false }: { isLastStep?: boolean }) => {
  return (
    <>
      <div className="flex aspect-square w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))]">
        <Check className="h-4 w-4 text-[hsl(var(--background))]" />
      </div>
      {!isLastStep && <div className="h-0.5 flex-grow bg-[hsl(var(--foreground))]" />}
    </>
  );
};

const CurrentStep = ({ index, totalSteps }: { index: number; totalSteps: number }) => {
  return (
    <>
      <div className="flex aspect-square w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--foreground))] bg-transparent">
        <Circle className="h-3 w-3 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--foreground))]" />
      </div>
      {index + 1 < totalSteps && <div className="h-0.5 flex-grow bg-[hsl(var(--input))]" />}
    </>
  );
};

const NextStep = ({ index, totalSteps }: { index: number; totalSteps: number }) => {
  return (
    <>
      <div className="flex aspect-square w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--input))] bg-transparent">
        <div className="h-3 w-3 rounded-full border-2 border-[hsl(var(--input))]" />
      </div>
      {index + 1 < totalSteps && <div className="h-0.5 flex-grow bg-[hsl(var(--input))]" />}
    </>
  );
};

export function AssetFormProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="mb-8 flex items-center">
      {Array.from({ length: totalSteps }).map((_, index) => {
        if (index < currentStep) {
          return <CompletedStep key={index} isLastStep={index === totalSteps - 1} />;
        }
        if (index === currentStep) {
          return <CurrentStep key={index} index={index} totalSteps={totalSteps} />;
        }
        return <NextStep key={index} index={index} totalSteps={totalSteps} />;
      })}
    </div>
  );
}
