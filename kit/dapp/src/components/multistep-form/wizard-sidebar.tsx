import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import type { StepDefinition, StepStatus } from "./types";
import { useWizardContext } from "./wizard-context";

interface WizardSidebarProps {
  className?: string;
}

export function WizardSidebar({ className }: WizardSidebarProps) {
  const {
    steps,
    groups,
    currentStepIndex,
    completedSteps,
    stepErrors,
    canNavigateToStep,
    navigateToStep,
  } = useWizardContext();

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Auto-expand groups that contain the current step
  useEffect(() => {
    const currentStep = steps[currentStepIndex];
    if (currentStep?.groupId && !expandedGroups.includes(currentStep.groupId)) {
      setExpandedGroups((prev) => [...prev, currentStep.groupId!]);
    }
  }, [currentStepIndex, steps, expandedGroups]);

  const getStepStatus = (step: StepDefinition, index: number): StepStatus => {
    if (stepErrors[step.id]) return "error";
    if (completedSteps.includes(step.id)) return "completed";
    if (index === currentStepIndex) return "active";
    return "pending";
  };

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "active":
        return <Circle className="h-4 w-4 text-primary fill-primary" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const renderStep = (step: StepDefinition, index: number) => {
    const status = getStepStatus(step, index);
    const isClickable = canNavigateToStep(index);

    return (
      <Button
        key={step.id}
        variant="ghost"
        className={cn(
          "w-full justify-start px-4 py-2 h-auto",
          status === "active" && "bg-accent",
          !isClickable && "cursor-not-allowed opacity-50"
        )}
        onClick={() => isClickable && navigateToStep(index)}
        disabled={!isClickable}
      >
        <div className="flex items-start gap-3 w-full">
          <div className="mt-0.5">{getStepIcon(status)}</div>
          <div className="flex-1 text-left">
            <div className="font-medium text-sm">{step.title}</div>
            {step.description && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </div>
            )}
            {stepErrors[step.id] && (
              <div className="text-xs text-destructive mt-1">
                {stepErrors[step.id]}
              </div>
            )}
          </div>
        </div>
      </Button>
    );
  };

  const renderGroupedSteps = () => {
    const ungroupedSteps = steps.filter((step) => !step.groupId);
    const groupedStepsByGroupId = steps.reduce((acc, step, index) => {
      if (step.groupId) {
        if (!acc[step.groupId]) acc[step.groupId] = [];
        acc[step.groupId]!.push({ step, index });
      }
      return acc;
    }, {} as Record<string, Array<{ step: StepDefinition; index: number }>>);

    return (
      <>
        {/* Render ungrouped steps first */}
        {ungroupedSteps.map((step) => {
          const index = steps.indexOf(step);
          return renderStep(step, index);
        })}

        {/* Render grouped steps */}
        {groups?.map((group) => {
          const groupSteps = groupedStepsByGroupId[group.id] || [];
          if (groupSteps.length === 0) return null;

          const hasActiveStep = groupSteps.some(
            ({ index }) => index === currentStepIndex
          );
          const hasError = groupSteps.some(
            ({ step }) => stepErrors[step.id]
          );
          const allCompleted = groupSteps.every(({ step }) =>
            completedSteps.includes(step.id)
          );

          if (!group.collapsible) {
            return (
              <div key={group.id} className="space-y-1">
                <div className="px-4 py-2">
                  <h3 className="font-medium text-sm">{group.title}</h3>
                  {group.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="pl-4">
                  {groupSteps.map(({ step, index }) => renderStep(step, index))}
                </div>
              </div>
            );
          }

          return (
            <Collapsible
              key={group.id}
              open={expandedGroups.includes(group.id)}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 py-2 h-auto",
                    hasActiveStep && "bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedGroups.includes(group.id) && "rotate-90"
                      )}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {group.title}
                        {allCompleted && (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        )}
                        {hasError && (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        )}
                      </div>
                      {group.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {group.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-7 space-y-1">
                {groupSteps.map(({ step, index }) => renderStep(step, index))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {groups ? renderGroupedSteps() : steps.map((step, index) => renderStep(step, index))}
    </div>
  );
}