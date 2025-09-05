import { StepComponent } from "@/components/stepper/step";
import { StepGroupComponent } from "@/components/stepper/step-group";
import type { NavigationMode } from "@/components/stepper/types";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import type { Step, StepOrGroup } from "./types";
import {
  flattenSteps,
  getCurrentStepIndex,
  getNextStep,
  getProgress,
  isStepGroup,
} from "./utils";

export interface StepLayoutProps<StepId, GroupId> {
  stepsOrGroups: StepOrGroup<StepId, GroupId>[];
  currentStep: Step<StepId>;
  onStepSelect: (step: Step<StepId>) => void;

  children:
    | React.ReactNode
    | ((props: {
        currentStep: Step<StepId>;
        nextStep: Step<StepId>;
      }) => React.ReactNode);
  navigationMode?: NavigationMode;
  className?: string;
  title: string;
  description: string;
}

export function StepLayout<StepId, GroupId>({
  stepsOrGroups,
  currentStep,
  onStepSelect,
  children,
  className,
  navigationMode = "next-only",
  title,
  description,
}: StepLayoutProps<StepId, GroupId>) {
  const allSteps = useMemo(() => flattenSteps(stepsOrGroups), [stepsOrGroups]);

  const renderGroupedSteps = () => {
    return (
      <div className={cn("step-layout flex gap-6")}>
        <div className="flex-shrink-0 w-80 space-y-2">
          {stepsOrGroups.map((item) => {
            if (isStepGroup(item)) {
              return (
                <StepGroupComponent
                  key={item.label}
                  group={item}
                  currentStep={currentStep}
                  allSteps={allSteps}
                  onStepSelect={onStepSelect}
                  navigation={navigationMode}
                />
              );
            }

            return (
              <StepComponent
                key={item.step}
                step={item}
                allSteps={allSteps}
                onStepSelect={onStepSelect}
                navigation={navigationMode}
                currentStep={currentStep}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "StepLayout h-full shadow-lg overflow-hidden flex",
        className
      )}
    >
      <SidebarProvider defaultOpen={true}>
        <Sidebar className="w-[360px] flex-shrink-0 transition-all duration-300 group-data-[side=left]:border-0 overflow-hidden">
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
                  {title}
                </h2>
                <p className="text-sm text-primary-foreground/90 leading-relaxed mb-4">
                  {description}
                </p>

                <div>
                  <div className="flex justify-between text-xs text-primary-foreground/80 mb-2">
                    <span>
                      Step {getCurrentStepIndex(allSteps, currentStep) + 1}
                    </span>
                    <span>
                      {getCurrentStepIndex(allSteps, currentStep) + 1} /{" "}
                      {allSteps.length}
                    </span>
                  </div>
                  <Progress
                    value={getProgress(allSteps, currentStep)}
                    className="h-2 bg-primary-foreground/20"
                  />
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-8 relative overflow-y-auto">
              {renderGroupedSteps()}
            </SidebarContent>
          </div>
        </Sidebar>

        {/* Main content area */}
        <div
          className="StepLayout__main flex-1 flex flex-col transition-all duration-300 relative"
          style={{ backgroundColor: "var(--sm-background-lightest)" }}
        >
          <div className="p-8 h-full flex">
            <div className="w-full">
              {typeof children === "function"
                ? children({
                    currentStep,
                    nextStep: getNextStep(allSteps, currentStep),
                  })
                : children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
