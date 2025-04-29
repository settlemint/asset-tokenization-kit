"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Step {
  id: string;
  title: string;
  description: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStepId: string;
  title: string;
  description: string;
  onStepChange: (stepId: string) => void;
  children: ReactNode;
  sidebarStyle?: React.CSSProperties;
  onClose?: () => void;
}

export function StepWizard({
  steps,
  currentStepId,
  title,
  description,
  onStepChange,
  children,
  sidebarStyle,
  onClose,
}: StepWizardProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden p-6">
        {/* Sidebar / Steps */}
        <div
          className="w-[25%] bg-primary p-6 flex flex-col rounded-xl"
          style={sidebarStyle}
        >
          {/* Title and Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary-foreground">
              {title}
            </h2>
            <p className="text-sm text-primary-foreground">{description}</p>
          </div>

          {/* Steps */}
          <div className="space-y-0 flex-1 overflow-y-auto relative">
            {steps.map((step, index) => {
              const isCurrent = currentStepId === step.id;
              const isCompleted = index < currentStepIndex;
              // Step is disabled if it's beyond the current step
              const isDisabled = index > currentStepIndex;
              // Special case: First step is never disabled
              const finalDisabled = index === 0 ? false : isDisabled;

              return (
                <div key={step.id} className="relative py-2">
                  {/* Vertical line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[1.5rem] top-[1.4rem] h-[calc(100%+0.5rem)] w-0 border-l-2 border-dashed border-slate-300 z-10"></div>
                  )}

                  <button
                    type="button"
                    className={cn(
                      "flex flex-col w-full px-3 py-2 rounded-md transition-colors text-left relative z-20",
                      isCurrent
                        ? "hover:bg-primary hover:text-primary-foreground"
                        : "text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      finalDisabled && "cursor-not-allowed",
                      !isCurrent && "text-muted-foreground"
                    )}
                    onClick={() => !finalDisabled && onStepChange(step.id)}
                    disabled={finalDisabled}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-full text-xs font-medium z-30 relative ",
                          // Conditional Size:
                          isCompleted ? "h-6 w-6" : "h-7 w-7",
                          // Add bg-sidebar for current/inactive states to cover the line
                          isCompleted
                            ? "bg-primary-foreground text-primary border-primary"
                            : isCurrent
                              ? "border-none text-primary-foreground bg-primary"
                              : "border-none text-primary-foreground bg-primary"
                        )}
                      >
                        {/* Conditional Icon Rendering */}
                        {isCompleted ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : isCurrent ? (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-current"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="7"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="8" cy="8" r="3" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-current"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm text-primary-foreground",
                          isCurrent ? "font-bold" : "font-medium"
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-xs mt-1 ml-9",
                        isCurrent
                          ? "text-primary-foreground/70"
                          : "text-primary-foreground/25"
                      )}
                    >
                      {step.description}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              className="mt-auto w-full text-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-auto bg-background ml-6 rounded-lg p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
