import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';
import {} from 'react';
import { Fragment } from 'react';

interface FormStepProgressProps {
  steps: number;
  currentStep: number;
  complete: boolean;
  className?: string;
}

export function FormStepProgress({ steps, currentStep, complete, className }: FormStepProgressProps) {
  let _currentStep = 0;
  let _complete = complete;
  if (currentStep > steps) {
    _currentStep = steps;
  } else {
    _currentStep = currentStep;
  }
  if (currentStep !== steps && complete) {
    _complete = false;
  }

  const CompletedStep = ({ isLastStep = false }: { isLastStep?: boolean }) => {
    return (
      <>
        <div className="flex aspect-square w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] p-1">
          <Check className=" h-full w-full text-[hsl(var(--background))]" />
        </div>
        {!isLastStep && <div className="h-0.5 flex-grow bg-[hsl(var(--foreground))]" />}
      </>
    );
  };

  const CurrentStep = ({ index }: { index: number }) => {
    return (
      <>
        <div className="flex aspect-square w-8 items-center justify-center rounded-full border-2 border-[hsl(var(--foreground))] bg-transparent ">
          <Circle className="h-3 w-3 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--foreground))]" />
        </div>
        {index + 1 < steps && <div className="h-0.5 flex-grow bg-[hsl(var(--input))]" />}
      </>
    );
  };

  const NextStep = ({ index }: { index: number }) => {
    return (
      <>
        <div className="flex aspect-square w-8 items-center justify-center rounded-full border-[4px] border-bg-[hsl(var(--input))] bg-transparent">
          <Circle className="h-full w-full rounded-full bg-transparent text-transparent" />
        </div>
        {index + 1 < steps && <div className="h-0.5 flex-grow bg-[hsl(var(--input))]" />}
      </>
    );
  };

  return (
    <div className={cn('FormStepProgress flex w-full items-center justify-between pb-6', className)}>
      {Array.from({ length: steps }).map((_, index) => {
        return (
          <Fragment key={index}>
            {index + 1 < _currentStep && <CompletedStep />}
            {index + 1 === _currentStep && !_complete && <CurrentStep index={index} />}
            {index + 1 === _currentStep && _complete && <CompletedStep isLastStep />}
            {index + 1 > currentStep && <NextStep index={index} />}
          </Fragment>
        );
      })}
    </div>
  );
}

FormStepProgress.displayName = 'FormStepProgress';
