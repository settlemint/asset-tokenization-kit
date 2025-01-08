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
  return (
    <div className={cn('FormStepProgress flex w-full items-center justify-between pb-6', className)}>
      {Array.from({ length: steps }).map((_, index) => {
        return (
          <Fragment key={index}>
            {index + 1 < _currentStep && (
              <>
                <div className="flex items-center justify-center rounded-full border-2 border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] p-1">
                  <Check className="h-full w-full text-[hsl(var(--background))]" />
                </div>
                <div className="h-0.5 flex-grow bg-[hsl(var(--foreground))]" />
              </>
            )}
            {index + 1 === _currentStep && !_complete && (
              <>
                <div className="flex items-center justify-center rounded-full border-2 border-[hsl(var(--foreground))] bg-transparent p-2">
                  <Circle className="h-4 w-4 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--foreground))]" />
                </div>
                {index + 1 < steps && <div className="h-0.5 flex-grow bg-[hsl(var(--input))]" />}
              </>
            )}
            {index + 1 === _currentStep && _complete && (
              <div className="flex items-center justify-center rounded-full border-2 border-black bg-black p-1">
                <Check className="h-full w-full text-[hsl(var(--background))]" />
              </div>
            )}
            {index + 1 > currentStep && (
              <>
                <div className="flex items-center justify-center rounded-full border-[4px] border-bg-[hsl(var(--input))] bg-transparent p-2">
                  <Circle className="h-4 w-4 rounded-full bg-transparent text-transparent" />
                </div>
                {index + 1 < steps && <div className="h-0.5 flex-grow bg-[hsl(var(--input))]" />}
              </>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

FormStepProgress.displayName = 'FormStepProgress';

/**
  <div className="flex items-center justify-center rounded-full border-2 border-black bg-transparent p-4">
        <div className="h-full w-full">
          <Circle className="h-4 w-4 rounded-full bg-black text-black" />
        </div>
      </div>
      <div className="h-1 flex-grow bg-black" />
      <div className="flex items-center justify-center rounded-full border-2 border-black bg-transparent p-4">
        <Circle className="h-4 w-4 rounded-full bg-transparent text-transparent" />
      </div>
      <div className="h-1 flex-grow bg-black" />
      <div className="flex items-center justify-center rounded-full border-2 border-black bg-transparent p-4">
        <Circle className="h-4 w-4 rounded-full bg-transparent text-transparent" />
      </div>

 */
