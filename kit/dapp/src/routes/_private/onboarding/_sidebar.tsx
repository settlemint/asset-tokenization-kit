import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import type { OnboardingStep } from "@/components/onboarding/state-machine";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { useOnboardingSteps } from "@/components/onboarding/use-onboarding-steps";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown } from "lucide-react";
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  // Initialize expanded groups
  useEffect(() => {
    const currentStep = stepsWithTranslations[currentStepIndex];
    const currentGroupId = currentStep?.groupId;

    const initialExpanded = new Set<string>();
    groups.forEach((group) => {
      if (
        String(group.id) === String(currentGroupId) ||
        group.defaultExpanded
      ) {
        initialExpanded.add(group.id);
      }
    });

    setExpandedGroups(initialExpanded);
  }, [groups, stepsWithTranslations, currentStepIndex]);

  // Update expanded groups when current step changes
  useEffect(() => {
    const currentStep = stepsWithTranslations[currentStepIndex];
    const currentGroupId = currentStep?.groupId;

    if (currentGroupId) {
      setExpandedGroups(new Set([currentGroupId]));
    }
  }, [currentStepIndex, stepsWithTranslations, groups]);

  // Toggle group expansion
  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Navigate to step
  const navigateToStep = useCallback(
    (stepId: OnboardingStep) => {
      void navigate({ to: `/onboarding/${stepId}` as const });
    },
    [navigate]
  );

  // Render individual step
  const renderStep = (
    step: ReturnType<typeof useOnboardingSteps>["stepsWithTranslations"][0],
    index: number,
    isLastInGroup = false
  ) => {
    const status = getStepStatus(step, index);
    const isCurrent = index === currentStepIndex;
    const isCompleted = status === "completed";
    const isAccessible = canNavigateToStep(index);

    return (
      <div key={step.step} className="flex items-stretch mb-0">
        {/* Dot column with line */}
        <div className="relative flex flex-col items-center w-12 pt-0">
          {/* The step dot */}
          <StepIndicator isCompleted={isCompleted} isCurrent={isCurrent} />

          {/* Connecting line (for all but last step) */}
          {!isLastInGroup && (
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
                navigateToStep(step.step);
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
                {step.title}
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
  };

  // Render grouped steps
  const renderGroupedSteps = () => {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 pr-2">
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
            const isExpanded = expandedGroups.has(group.id);

            return (
              <div key={group.id} className="relative">
                {/* Clickable Group Header */}
                <button
                  type="button"
                  onClick={() => {
                    toggleGroupExpansion(group.id);
                  }}
                  className={cn(
                    "w-full text-left mb-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/10",
                    hasActiveStep && "bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-primary-foreground/60 transition-transform duration-200",
                        isExpanded ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </div>
                  {group.description && (
                    <p className="text-xs text-primary-foreground/50 mt-1">
                      {group.description}
                    </p>
                  )}
                </button>

                {/* Collapsible Group Steps */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded
                      ? "max-h-[800px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="pl-6">
                    {groupSteps.map(({ step, index }, stepIndex) => {
                      const isLastInGroup = stepIndex === groupSteps.length - 1;
                      return renderStep(step, index, isLastInGroup);
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Render ungrouped steps if any */}
          {groupedStepsByGroupId.ungrouped && (
            <div className="relative">
              <div className="pl-2">
                {groupedStepsByGroupId.ungrouped.map(
                  ({ step, index }, stepIndex) => {
                    const isLastStep =
                      stepIndex ===
                      (groupedStepsByGroupId.ungrouped?.length ?? 0) - 1;
                    return renderStep(step, index, isLastStep);
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="OnboardingSidebar flex flex-col h-full rounded-xl shadow-lg overflow-hidden">
      <SidebarProvider>
        <Sidebar className="w-[320px] flex-shrink-0 transition-all duration-300 group-data-[side=left]:border-0">
          <div
            className="w-full overflow-y-auto"
            style={{
              background: "var(--sm-wizard-sidebar-gradient)",
              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
              maxHeight: "calc(100% - 200px)",
              height: "calc(100% - 200px)",
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

            <SidebarContent className="px-8 ">
              {renderGroupedSteps()}
            </SidebarContent>
          </div>
        </Sidebar>

        {/* Main content area */}
        <div
          className="flex-1 flex flex-col transition-all duration-300 relative"
          style={{ backgroundColor: "var(--sm-background-lightest)" }}
        >
          <div className="flex-1 p-8">
            <div
              className="w-full overflow-y-auto"
              style={{ maxHeight: "calc(100% - 200px)" }}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
