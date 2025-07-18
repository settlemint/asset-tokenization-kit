import { OnboardingStepGroup } from "@/components/onboarding/state-machine";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "usehooks-ts";

interface WelcomeProps {
  steps: {
    step: string;
    groupId: OnboardingStepGroup;
    current: boolean;
    completed: boolean;
  }[];
}

export function Welcome({ steps }: WelcomeProps) {
  const { t } = useTranslation(["onboarding", "general"]);
  const [isReturningUser] = useLocalStorage("isReturningUser", false);
  const navigate = useNavigate();

  const handleGetStarted = useCallback(() => {
    void navigate({ to: "/onboarding/wallet" });
  }, [navigate]);

  // Group steps by their group
  const groupedSteps: Record<OnboardingStepGroup, typeof steps> = {
    [OnboardingStepGroup.wallet]: [],
    [OnboardingStepGroup.system]: [],
    [OnboardingStepGroup.identity]: [],
  };

  for (const step of steps) {
    groupedSteps[step.groupId].push(step);
  }

  const getGroupIcon = (groupSteps: typeof steps) => {
    // Check if all steps in the group are completed
    const allCompleted = groupSteps.every((step) => step.completed);
    // Check if any step in the group is current
    const hasCurrent = groupSteps.some((step) => step.current);

    if (allCompleted) {
      return (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sm-graphics-secondary">
          <Check className="h-3 w-3 text-white" />
        </div>
      );
    } else if (hasCurrent) {
      return (
        <div className="h-5 w-5 rounded-full bg-sm-state-success-background animate-pulse" />
      );
    } else {
      return (
        <div className="h-5 w-5 rounded-full border-2 border-sm-graphics-primary" />
      );
    }
  };

  const getGroupTitle = (groupId: OnboardingStepGroup) => {
    switch (groupId) {
      case OnboardingStepGroup.wallet:
        return t("onboarding:groups.wallet.title", { defaultValue: "Wallet" });
      case OnboardingStepGroup.system:
        return t("onboarding:groups.system.title", { defaultValue: "System" });
      case OnboardingStepGroup.identity:
        return t("onboarding:groups.identity.title", {
          defaultValue: "Identity",
        });
      default:
        return groupId;
    }
  };

  const getGroupDescription = (groupId: OnboardingStepGroup) => {
    switch (groupId) {
      case OnboardingStepGroup.wallet:
        return t("onboarding:groups.wallet.description", {
          defaultValue: "Set up your wallet and security measures",
        });
      case OnboardingStepGroup.system:
        return t("onboarding:groups.system.description", {
          defaultValue: "Deploy and configure your system",
        });
      case OnboardingStepGroup.identity:
        return t("onboarding:groups.identity.description", {
          defaultValue: "Establish your on-chain identity",
        });
      default:
        return "";
    }
  };

  // Find which group contains the current step
  const currentGroup = steps.find((step) => step.current)?.groupId;
  const defaultOpenGroups = currentGroup ? [currentGroup] : [];

  return (
    <div style={{ background: "var(--sm-wizard-sidebar-gradient)" }}>
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-primary-foreground">
            {isReturningUser
              ? t("onboarding:welcome.welcome-back")
              : t("onboarding:welcome.title")}
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            {isReturningUser
              ? t("onboarding:welcome.complete-journey")
              : t("onboarding:welcome.description")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-primary-foreground">
              {t("onboarding:welcome.setup-overview")}
            </h2>
            <p className="text-primary-foreground/80 max-w-3xl mx-auto">
              {isReturningUser
                ? t("onboarding:welcome.setup-description-returning")
                : t("onboarding:welcome.setup-description-new")}
            </p>
          </div>

          <div className="rounded-lg">
            <Accordion
              type="single"
              collapsible
              className="w-full"
              style={{ background: "transparent", boxShadow: "none" }}
              defaultValue={defaultOpenGroups[0]}
            >
              {(
                Object.entries(groupedSteps) as [
                  OnboardingStepGroup,
                  typeof steps,
                ][]
              ).map(([groupId, groupSteps]) => (
                <AccordionItem
                  key={groupId}
                  value={groupId}
                  className="border-b last:border-b-0"
                >
                  <AccordionTrigger className="justify-start gap-3 py-4 px-6 text-left hover:no-underline [&>svg]:hidden">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">{getGroupIcon(groupSteps)}</div>
                      <div className="text-left">
                        <h3 className="font-semibold text-base text-primary-foreground">
                          {getGroupTitle(groupId)}
                        </h3>
                        <p className="text-sm text-primary-foreground/80">
                          {getGroupDescription(groupId)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <Timeline className="ml-8 space-y-3">
                      {groupSteps.map((step, index) => (
                        <TimelineItem
                          key={step.step}
                          step={index + 1}
                          className="pb-2"
                        >
                          <TimelineHeader className="items-start">
                            <TimelineSeparator className="top-[12px] left-[15px] h-[50px] w-0.5 bg-sm-graphics-primary/30" />
                            <TimelineIndicator className="border-0 bg-transparent">
                              <div className="-mt-[14px]">
                                {step.completed ? (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-sm-graphics-secondary">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                ) : step.current ? (
                                  <div className="h-4 w-4 rounded-full bg-sm-state-success-background animate-pulse" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-sm-graphics-primary" />
                                )}
                              </div>
                            </TimelineIndicator>
                            <div className="flex-1">
                              <TimelineTitle className="text-primary-foreground">
                                {t(`onboarding:steps.${step.step}.title`, {
                                  defaultValue: step.step,
                                })}
                              </TimelineTitle>
                              <TimelineContent className="text-primary-foreground/80">
                                {t(
                                  `onboarding:steps.${step.step}.description`,
                                  {
                                    defaultValue: step.step,
                                  }
                                )}
                              </TimelineContent>
                            </div>
                          </TimelineHeader>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            className="min-w-[200px] bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={handleGetStarted}
          >
            {isReturningUser
              ? t("onboarding:welcome.continue-setup")
              : t("onboarding:welcome.get-started")}
          </Button>
        </div>
      </div>
    </div>
  );
}
