"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useMemo, type ReactNode } from "react";

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
  onClose?: () => void;
}

export function StepWizard({
  steps,
  currentStepId,
  title,
  description,
  onStepChange,
  children,
  onClose,
}: StepWizardProps) {
  const { theme } = useTheme();
  const sidebarStyle = useMemo(() => {
    return {
      backgroundImage:
        theme === "dark"
          ? "linear-gradient(45deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5))"
          : "linear-gradient(45deg, rgba(52, 110, 238, 0.5), rgba(137, 214, 162, 0.8))",
      backgroundSize: "cover",
      backgroundPosition: "top",
      backgroundRepeat: "no-repeat",
      minWidth: "200px",
    };
  }, [theme]);

  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="flex h-full" tabIndex={-1}>
      <div className="flex h-full w-full" tabIndex={-1}>
        {/* Sidebar / Steps */}
        <div
          className="w-[250px] h-[calc(85vh-3rem)] flex-shrink-0 bg-primary m-6 mr-0 p-6 flex flex-col rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
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
          <div className="space-y-0 flex-1 relative pt-1">
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
                        "flex shrink-0 items-center justify-center rounded-full text-xs font-medium z-30 h-6 w-6 opacity-70 text-primary-foreground transition-all duration-300 ease-in-out",
                        isCurrent && "opacity-100"
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

          {/* Close button */}
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

        {/* Content area */}
        <div className="h-[85vh] flex-1 overflow-y-auto bg-background py-6 rounded-lg">
          <div className="p-10 pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
