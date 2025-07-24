import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import type { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingSteps } from "@/components/onboarding/use-onboarding-steps";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/_sidebar")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding"]);
  const { steps, currentStep } = Route.useRouteContext();
  const navigate = useNavigate();
  const [expandedGroup, setExpandedGroup] = useState<string>("");

  const {
    stepsWithTranslations,
    groups,
    currentStepIndex,
    progress,
    isGroupCompleted,
    getStepStatus,
    canNavigateToStep,
    groupedStepsByGroupId,
  } = useOnboardingSteps(steps, currentStep);

  // Update expanded group when current step changes
  useEffect(() => {
    const currentStep = stepsWithTranslations[currentStepIndex];
    const currentGroupId = currentStep?.groupId;

    if (currentGroupId) {
      setExpandedGroup(currentGroupId);
    } else {
      // Find first group with default expanded or first group
      const defaultGroup =
        groups.find((group) => group.defaultExpanded) ?? groups[0];
      if (defaultGroup) {
        setExpandedGroup(defaultGroup.id);
      }
    }
  }, [groups, stepsWithTranslations, currentStepIndex]);

  // Navigate to step
  const navigateToStep = useCallback(
    (stepId: OnboardingStep) => {
      void navigate({ to: `/onboarding/${stepId}` as const });
    },
    [navigate]
  );

  // Render grouped steps
  const renderGroupedSteps = () => {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 pr-2">
          <Accordion
            type="single"
            collapsible
            className="w-full bg-transparent"
            style={{ background: "transparent", boxShadow: "none" }}
            value={expandedGroup}
            onValueChange={setExpandedGroup}
          >
            {groups.map((group) => {
              const groupSteps = groupedStepsByGroupId[group.id] ?? [];
              if (groupSteps.length === 0) {
                return null;
              }

              // Check if any step in this group is active
              const hasActiveStep = groupSteps.some(
                ({ index }) => index === currentStepIndex
              );

              const groupCompleted = isGroupCompleted(group.id);

              return (
                <AccordionItem
                  key={group.id}
                  value={group.id}
                  className="border-b-0 bg-transparent"
                >
                  <AccordionTrigger
                    className={cn(
                      "justify-start text-left mb-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:no-underline [&>svg]:hidden",
                      hasActiveStep && "bg-white/5"
                    )}
                  >
                    <div className="flex flex-col w-full text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={cn(
                            "text-base font-bold transition-all duration-300",
                            hasActiveStep
                              ? "text-primary-foreground"
                              : "text-primary-foreground/70"
                          )}
                        >
                          {group.title}
                        </h3>
                        {groupCompleted && (
                          <Check className="w-4 h-4 text-sm-state-success" />
                        )}
                      </div>
                      {group.description && (
                        <p className="text-xs text-primary-foreground/50">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pl-2 bg-transparent">
                    <Timeline className="ml-4 space-y-3">
                      {groupSteps.map(({ step, index }, stepIndex) => {
                        const status = getStepStatus(step, index);
                        const isCurrent = index === currentStepIndex;
                        const isCompleted = status === "completed";
                        const isAccessible = canNavigateToStep(index);
                        const isLastInGroup =
                          stepIndex === groupSteps.length - 1;

                        return (
                          <TimelineItem
                            key={step.step}
                            step={stepIndex + 1}
                            className="pb-2"
                          >
                            <TimelineHeader className="items-start">
                              {!isLastInGroup && (
                                <TimelineSeparator className="top-[12px] left-[15px] h-[50px] w-0.5 bg-sm-graphics-primary/30" />
                              )}
                              <TimelineIndicator className="border-0 bg-transparent">
                                <div className="-mt-[14px]">
                                  {isCompleted ? (
                                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-sm-graphics-secondary">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  ) : isCurrent ? (
                                    <div className="h-4 w-4 rounded-full bg-sm-state-success-background animate-pulse" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-sm-graphics-primary" />
                                  )}
                                </div>
                              </TimelineIndicator>
                              <div className="flex-1">
                                <button
                                  type="button"
                                  className={cn(
                                    "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 relative z-20",
                                    isCurrent && "bg-white/10 backdrop-blur-sm",
                                    !isAccessible &&
                                      "cursor-not-allowed opacity-60",
                                    isAccessible && "hover:bg-white/15",
                                    isCompleted &&
                                      !isCurrent &&
                                      "cursor-pointer hover:bg-white/10"
                                  )}
                                  onClick={() => {
                                    if (isAccessible) {
                                      navigateToStep(step.step);
                                    }
                                  }}
                                  disabled={!isAccessible}
                                >
                                  <TimelineTitle
                                    className={cn(
                                      "transition-all duration-300",
                                      isCurrent
                                        ? "font-bold text-primary-foreground"
                                        : "font-medium text-primary-foreground/90"
                                    )}
                                  >
                                    {step.title}
                                  </TimelineTitle>
                                  <TimelineContent
                                    className={cn(
                                      "mt-1 transition-colors duration-300 leading-relaxed",
                                      isCurrent
                                        ? "text-primary-foreground/90"
                                        : "text-primary-foreground/70"
                                    )}
                                  >
                                    {step.description}
                                  </TimelineContent>
                                </button>
                              </div>
                            </TimelineHeader>
                          </TimelineItem>
                        );
                      })}
                    </Timeline>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Render ungrouped steps if any */}
          {groupedStepsByGroupId.ungrouped && (
            <div className="relative">
              <div className="pl-2">
                <Timeline className="ml-4 space-y-3">
                  {groupedStepsByGroupId.ungrouped.map(
                    ({ step, index }, stepIndex) => {
                      const status = getStepStatus(step, index);
                      const isCurrent = index === currentStepIndex;
                      const isCompleted = status === "completed";
                      const isAccessible = canNavigateToStep(index);
                      const isLastStep =
                        stepIndex ===
                        (groupedStepsByGroupId.ungrouped?.length ?? 0) - 1;

                      return (
                        <TimelineItem
                          key={step.step}
                          step={stepIndex + 1}
                          className="pb-2"
                        >
                          <TimelineHeader className="items-start">
                            {!isLastStep && (
                              <TimelineSeparator className="top-[12px] left-[15px] h-[50px] w-0.5 bg-sm-graphics-primary/30" />
                            )}
                            <TimelineIndicator className="border-0 bg-transparent">
                              <div className="-mt-[14px]">
                                {isCompleted ? (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-sm-graphics-secondary">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                ) : isCurrent ? (
                                  <div className="h-4 w-4 rounded-full bg-sm-state-success-background animate-pulse" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-sm-graphics-primary" />
                                )}
                              </div>
                            </TimelineIndicator>
                            <div className="flex-1">
                              <button
                                type="button"
                                className={cn(
                                  "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 relative z-20",
                                  isCurrent && "bg-white/10 backdrop-blur-sm",
                                  !isAccessible &&
                                    "cursor-not-allowed opacity-60",
                                  isAccessible && "hover:bg-white/15",
                                  isCompleted &&
                                    !isCurrent &&
                                    "cursor-pointer hover:bg-white/10"
                                )}
                                onClick={() => {
                                  if (isAccessible) {
                                    navigateToStep(step.step);
                                  }
                                }}
                                disabled={!isAccessible}
                              >
                                <TimelineTitle
                                  className={cn(
                                    "transition-all duration-300",
                                    isCurrent
                                      ? "font-bold text-primary-foreground"
                                      : "font-medium text-primary-foreground/90"
                                  )}
                                >
                                  {step.title}
                                </TimelineTitle>
                                <TimelineContent
                                  className={cn(
                                    "mt-1 transition-colors duration-300 leading-relaxed",
                                    isCurrent
                                      ? "text-primary-foreground/90"
                                      : "text-primary-foreground/70"
                                  )}
                                >
                                  {step.description}
                                </TimelineContent>
                              </button>
                            </div>
                          </TimelineHeader>
                        </TimelineItem>
                      );
                    }
                  )}
                </Timeline>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="OnboardingSidebar flex flex-col h-full rounded-xl shadow-lg overflow-y-hidden">
      <SidebarProvider>
        <Sidebar className="w-[320px] flex-shrink-0 transition-all duration-300 group-data-[side=left]:border-0">
          <div
            className="w-full overflow-y-auto h-full"
            style={{
              background: "var(--sm-wizard-sidebar-gradient)",
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
            }}
          >
            <SidebarHeader className="p-6 pb-0">
              {/* Title and Progress */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                  {t("onboarding:sidebar.title")}
                </h2>
                <p className="text-sm text-primary-foreground/90 leading-relaxed mb-4">
                  {t("onboarding:sidebar.description")}
                </p>

                <div>
                  <div className="flex justify-between text-xs text-primary-foreground/80 mb-2">
                    <span>Step {currentStepIndex + 1}</span>
                    <span>
                      {currentStepIndex + 1} / {stepsWithTranslations.length}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-primary-foreground/20"
                  />
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-8 relative">
              {renderGroupedSteps()}
            </SidebarContent>
          </div>
        </Sidebar>

        {/* Main content area */}
        <div
          className="OnboardingSidebar__main flex-1 flex flex-col transition-all duration-300 relative"
          style={{ backgroundColor: "var(--sm-background-lightest)" }}
        >
          <div className="flex-1 p-8">
            <div
              className="w-full overflow-y-auto"
              style={{ maxHeight: "calc(100% - 80px)" }}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
