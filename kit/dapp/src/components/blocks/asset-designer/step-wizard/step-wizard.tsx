"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import * as React from "react";

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
    <div className="flex h-full min-h-[65vh] flex-col" tabIndex={-1}>
      <div className="flex flex-1 overflow-hidden p-6" tabIndex={-1}>
        {/* Sidebar / Steps */}
        <div
          className="w-[25%] bg-primary p-6 flex flex-col rounded-xl"
          style={sidebarStyle}
          aria-hidden="true"
          tabIndex={-1}
        >
          {/* Title and Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-primary-foreground">
              {title}
            </h2>
            <p className="text-sm text-primary-foreground pt-2">
              {description}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-0 flex-1 overflow-y-auto relative pt-1">
            {steps.map((step, index) => {
              const isCurrent = currentStepId === step.id;
              const isCompleted = index < currentStepIndex;
              // Step is disabled if it's beyond the current step
              const isDisabled = index > currentStepIndex;
              // Special case: First step is never disabled
              const finalDisabled = index === 0 ? false : isDisabled;

              return (
                <div key={step.id} className="flex items-stretch mb-0">
                  {/* Dot column with line */}
                  <div className="relative flex flex-col items-center w-12 pt-0">
                    {/* The step dot */}
                    <div
                      className={cn(
<<<<<<< HEAD
                        "flex shrink-0 items-center justify-center rounded-full text-xs font-medium z-30 h-6 w-6 opacity-70 text-primary-foreground transition-all duration-300 ease-in-out",
                        // Only current step gets larger
                        isCurrent && "opacity-100"
=======
                        "absolute left-[1.5rem] top-[1.4rem] h-[calc(100%+0.5rem)] w-0 border-l-2 border-dashed border-slate-300 z-10 transition-opacity duration-300 ease-in-out",
                        isCompleted ? "opacity-100" : "opacity-50"
                      )}
                    ></div>
                  )}

                  <button
                    type="button"
                    tabIndex={-1}
                    className={cn(
                      "flex flex-col w-full px-3 py-2 rounded-md transition-colors text-left relative z-20",
                      finalDisabled && "cursor-not-allowed",
                      !isCurrent && "text-muted-foreground"
                    )}
                    onClick={() => !finalDisabled && onStepChange(step.id)}
                    disabled={finalDisabled}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "flex shrink-0 items-center justify-center rounded-full text-xs font-medium z-30 relative transition-all duration-300 ease-in-out",
                          // Conditional Size & Scale:
                          isCompleted
                            ? "h-6 w-6 scale-100 opacity-100"
                            : "h-7 w-7 scale-100 opacity-100",
                          isCurrent && "scale-110",
                          // Initial state for animation (when not completed/current yet)
                          !isCompleted && !isCurrent && "scale-90 opacity-70",
                          // Add bg-sidebar for current/inactive states to cover the line
                          isCompleted
                            ? "bg-primary-foreground text-primary border-primary"
                            : isCurrent
                              ? "border-none text-primary-foreground bg-primary"
                              : "border-none text-primary-foreground bg-primary"
                        )}
                      >
                        {/* Conditional Icon Rendering with Transitions */}
                        <div className="transition-opacity duration-300 ease-in-out">
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
                              className="opacity-100"
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
                              className="text-current opacity-100"
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
                              className="text-current opacity-100"
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
                      </div>
                      <span
                        className={cn(
                          "text-sm text-primary-foreground transition-colors duration-300",
                          isCurrent ? "font-bold" : "font-medium"
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-xs mt-1 ml-9 transition-colors duration-300",
                        isCurrent
                          ? "text-primary-foreground/70"
                          : "text-primary-foreground/25"
>>>>>>> origin/main
                      )}
                    >
                      {/* Conditional Icon Rendering with Transitions */}
                      <div className="transition-opacity duration-300 ease-in-out flex items-center justify-center">
                        {isCompleted ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="text-current"
                          >
                            <circle cx="8" cy="8" r="7" fill="white" />
                            <path
                              d="M10.5 6.5L7 9.5L5.5 8"
                              stroke="rgba(54, 139, 207, 1)"
                              strokeWidth="1.50"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : isCurrent ? (
                          <svg
                            width="27"
                            height="27"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-current"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="8" cy="8" r="3" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-current"
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
                          "w-0 border-l-2 border-dashed border-slate-300 flex-grow opacity-50"
                        )}
                      ></div>
                    )}
                  </div>

                  {/* Content column */}
                  <div className="flex-1 flex items-center -mt-1 mb-2">
                    <button
                      type="button"
                      tabIndex={-1}
                      className={cn(
                        "flex flex-col w-full px-3 py-2 rounded-md transition-colors text-left relative z-20",
                        isCurrent ? "" : "text-primary-foreground",
                        finalDisabled && "cursor-not-allowed opacity-60",
                        !isCurrent && "text-muted-foreground"
                      )}
                      style={{
                        ["--hover-color" as any]: "white",
                      }}
                      onClick={() => !finalDisabled && onStepChange(step.id)}
                      disabled={finalDisabled}
                      onMouseEnter={(e) => {
                        if (!finalDisabled) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.2)";
                          e.currentTarget.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!finalDisabled) {
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.color = isCurrent
                            ? ""
                            : "var(--muted-foreground)";
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "text-sm text-primary-foreground transition-colors duration-300",
                            isCurrent ? "font-bold" : "font-medium"
                          )}
                        >
                          {step.title}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-1 transition-colors duration-300",
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
            })}
          </div>

          {/* Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              className="mt-auto w-full text-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={onClose}
              tabIndex={-1}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Content area - REMOVED FOCUS SCOPE */}
        <div className="flex flex-col flex-1 overflow-hidden bg-background ml-6 rounded-lg p-10 pt-6 pr-14">
          {children}
        </div>
      </div>
    </div>
  );
}
