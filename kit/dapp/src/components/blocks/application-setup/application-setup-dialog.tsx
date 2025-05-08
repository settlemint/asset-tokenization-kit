"use client";

import {
  type Step,
  StepWizard,
} from "@/components/blocks/asset-designer/step-wizard/step-wizard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MiniProgressBar } from "../mini-progress-bar/mini-progress-bar";
import { BootstrapStep } from "./steps/bootstrap";
import { IntroStep } from "./steps/intro";

interface ApplicationSetupDialogProps {
  open: boolean;
}

export type ApplicationSetupStep =
  | "intro"
  | "bootstrap"
  | "settings"
  | "summary";

type TranslationKeys = Parameters<
  ReturnType<typeof useTranslations<"admin.application-setup">>
>[0];

const stepDetailsMap: Record<
  ApplicationSetupStep,
  { title: TranslationKeys; description: TranslationKeys }
> = {
  intro: {
    title: "steps.intro.title",
    description: "steps.intro.description",
  },
  bootstrap: {
    title: "steps.bootstrap.title",
    description: "steps.bootstrap.description",
  },
  settings: {
    title: "steps.settings.title",
    description: "steps.settings.description",
  },
  summary: {
    title: "steps.summary.title",
    description: "steps.summary.description",
  },
};

// Define the order of steps
const stepsOrder: ApplicationSetupStep[] = [
  "intro",
  "bootstrap",
  "settings",
  "summary",
];

export function ApplicationSetupDialog({ open }: ApplicationSetupDialogProps) {
  const t = useTranslations("admin.application-setup");
  const [currentStep, setCurrentStep] = useState<ApplicationSetupStep>("intro");
  const wizardSteps = stepsOrder.map(
    (stepId): Step => ({
      id: stepId,
      title: t(stepDetailsMap[stepId].title),
      description: t(stepDetailsMap[stepId].description),
    })
  );
  const currentStepIndex = stepsOrder.findIndex((step) => step === currentStep);

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-h-[95vh] min-h-[70vh] h-auto w-[90vw] lg:w-[75vw] p-0 overflow-auto border-none right-0 !max-w-screen rounded-2xl"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <div className="relative">
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>

          <StepWizard
            steps={wizardSteps}
            currentStepId={currentStep}
            title={t("title")}
            description={t("description")}
            onStepChange={(stepId) =>
              setCurrentStep(stepId as ApplicationSetupStep)
            }
          >
            {currentStep === "intro" && (
              <IntroStep onNext={() => setCurrentStep("bootstrap")} />
            )}
            {currentStep === "bootstrap" && (
              <BootstrapStep onNext={() => setCurrentStep("settings")} />
            )}
          </StepWizard>

          <MiniProgressBar
            totalSteps={stepsOrder.length}
            currentStepIndex={currentStepIndex}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
