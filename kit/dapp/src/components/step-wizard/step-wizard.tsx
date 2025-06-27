import { type ReactNode, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description: string;
  status?: 'pending' | 'active' | 'completed' | 'error';
}

interface StepWizardProps {
  steps: Step[];
  currentStepId: string;
  title: string;
  description: string;
  onStepChange: (stepId: string) => void;
  children: ReactNode;
  onClose?: () => void;
  showBackButton?: boolean;
  showNextButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
}

export function StepWizard({
  steps,
  currentStepId,
  title,
  description,
  onStepChange,
  children,
  onClose,
  showBackButton = true,
  showNextButton = true,
  onBack,
  onNext,
  nextLabel,
  backLabel,
  isNextDisabled = false,
  isBackDisabled = false,
}: StepWizardProps) {
  const sidebarStyle = useMemo(() => {
    return {
      background: 'var(--sm-wizard-sidebar-gradient)',
      backgroundSize: 'cover',
      backgroundPosition: 'top',
      backgroundRepeat: 'no-repeat',
      minWidth: '280px',
    };
  }, []);

  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="flex h-full min-h-[600px]">
      <div className="flex h-full w-full overflow-hidden rounded-xl shadow-lg">
        {/* Sidebar / Steps */}
        <div
          className="flex w-[320px] flex-shrink-0 flex-col p-8 transition-all duration-300"
          style={sidebarStyle}
        >
          {/* Title and Description */}
          <div className="mb-8">
            <h2 className="mb-2 font-bold text-2xl text-primary-foreground">
              {title}
            </h2>
            <p className="text-primary-foreground/90 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-primary-foreground/80 text-xs">
              <span>Step {currentStepIndex + 1}</span>
              <span>
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
            <Progress
              className="h-2 bg-primary-foreground/20"
              value={progressPercentage}
            />
          </div>

          {/* Steps */}
          <div className="relative flex-1 space-y-0">
            {steps.map((step, index) => {
              const isCurrent = currentStepId === step.id;
              const isCompleted =
                index < currentStepIndex || step.status === 'completed';
              const isError = step.status === 'error';

              // Calculate which steps should be accessible
              const latestCompletedStepIndex = steps.reduce(
                (maxIndex, s, i) => {
                  return s.status === 'completed'
                    ? Math.max(maxIndex, i)
                    : maxIndex;
                },
                -1
              );

              const isAccessible =
                step.status === 'completed' ||
                step.status === 'active' ||
                index <= latestCompletedStepIndex + 1;

              const finalDisabled = !isAccessible;

              return (
                <div className="mb-0 flex items-stretch" key={step.id}>
                  {/* Dot column with line */}
                  <div className="relative flex w-12 flex-col items-center pt-0">
                    {/* The step dot */}
                    <div
                      className={cn(
                        'z-30 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium text-primary-foreground text-xs opacity-70 transition-all duration-300 ease-in-out',
                        isCurrent && 'opacity-100',
                        isError && 'opacity-100'
                      )}
                    >
                      {/* Conditional Icon Rendering with Transitions */}
                      <div className="flex items-center justify-center transition-all duration-300 ease-in-out">
                        {isError ? (
                          <svg
                            className="text-current"
                            fill="none"
                            height="24"
                            viewBox="0 0 16 16"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="8" cy="8" fill="#ef4444" r="7" />
                            <path
                              d="M6 6L10 10M10 6L6 10"
                              stroke="white"
                              strokeLinecap="round"
                              strokeWidth="1.5"
                            />
                          </svg>
                        ) : isCompleted ? (
                          <svg
                            className="text-current"
                            fill="none"
                            height="20"
                            viewBox="0 0 16 16"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="8" cy="8" fill="white" r="7" />
                            <path
                              d="M10.5 6.5L7 9.5L5.5 8"
                              stroke="rgba(54, 139, 207, 1)"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.50"
                            />
                          </svg>
                        ) : isCurrent ? (
                          <svg
                            className="text-current"
                            fill="none"
                            height="27"
                            viewBox="0 0 16 16"
                            width="27"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="8" cy="8" fill="currentColor" r="3" />
                          </svg>
                        ) : (
                          <svg
                            className="text-current"
                            fill="none"
                            height="20"
                            viewBox="0 0 16 16"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              strokeWidth="1.75"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Connecting line (for all but last step) */}
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-0 flex-grow border-l-2 border-dashed transition-colors duration-300',
                          isCompleted ? 'border-white/60' : 'border-white/30'
                        )}
                      />
                    )}
                  </div>

                  {/* Content column */}
                  <div className="-mt-1 mb-4 flex flex-1 items-center">
                    <button
                      className={cn(
                        'group relative z-20 flex w-full flex-col rounded-lg px-4 py-3 text-left transition-all duration-200',
                        isCurrent && 'bg-white/10 backdrop-blur-sm',
                        finalDisabled && 'cursor-not-allowed opacity-60',
                        !finalDisabled && 'hover:bg-white/15',
                        isCompleted &&
                          !isCurrent &&
                          'cursor-pointer hover:bg-white/10'
                      )}
                      disabled={finalDisabled}
                      onClick={() => {
                        if (!finalDisabled) {
                          onStepChange(step.id);
                        }
                      }}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-sm transition-all duration-300',
                            isCurrent
                              ? 'font-bold text-primary-foreground'
                              : 'font-medium text-primary-foreground/90',
                            isError && 'text-red-200'
                          )}
                        >
                          {step.title}
                        </span>
                        {isError && (
                          <span className="font-medium text-red-200 text-xs">
                            Error
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'mt-1 text-xs leading-relaxed transition-colors duration-300',
                          isCurrent
                            ? 'text-primary-foreground/90'
                            : 'text-primary-foreground/70',
                          isError && 'text-red-200/80'
                        )}
                      >
                        {step.description}
                      </p>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Close button */}
          {onClose && (
            <Button
              className="mt-auto w-full text-primary-foreground transition-all duration-200 hover:bg-white/10 hover:text-primary-foreground"
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Content area */}
        <div
          className="relative flex flex-1 flex-col overflow-hidden transition-all duration-300"
          style={{ backgroundColor: 'var(--sm-background-lightest)' }}
        >
          <div className="flex-1 overflow-y-auto p-8">
            <div className="h-full w-full">{children}</div>
          </div>

          {/* Navigation buttons */}
          {(showBackButton || showNextButton) && (
            <div className="relative z-20 p-6">
              <div className="flex justify-end gap-3">
                {showBackButton && onBack && (
                  <Button
                    className="transition-all duration-200"
                    disabled={isBackDisabled}
                    onClick={onBack}
                    variant="outline"
                  >
                    {backLabel ?? 'Back'}
                  </Button>
                )}
                {showNextButton && onNext && (
                  <Button
                    className="transition-all duration-200"
                    disabled={isNextDisabled}
                    onClick={onNext}
                  >
                    {nextLabel ?? 'Next'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
