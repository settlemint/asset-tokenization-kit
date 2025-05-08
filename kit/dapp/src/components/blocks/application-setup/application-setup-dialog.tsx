"use client";

import {
  type Step,
  StepWizard,
} from "@/components/blocks/asset-designer/step-wizard/step-wizard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MiniProgressBar } from "../mini-progress-bar/mini-progress-bar";

interface ApplicationSetupDialogProps {
  open: boolean;
}

export type ApplicationSetupStep = "contracts" | "settings" | "summary";
type TranslationKeys = Parameters<
  ReturnType<typeof useTranslations<"admin.application-setup">>
>[0];

const stepDetailsMap: Record<
  ApplicationSetupStep,
  { title: TranslationKeys; description: TranslationKeys }
> = {
  contracts: {
    title: "steps.contracts.title",
    description: "steps.contracts.description",
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
const stepsOrder: ApplicationSetupStep[] = ["contracts", "settings", "summary"];

export function ApplicationSetupDialog({ open }: ApplicationSetupDialogProps) {
  const t = useTranslations("admin.application-setup");
  const [currentStep, setCurrentStep] =
    useState<ApplicationSetupStep>("contracts");
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
      <DialogContent className="max-h-[95vh] min-h-[70vh] h-auto w-[90vw] lg:w-[75vw] p-0 overflow-auto border-none right-0 !max-w-screen rounded-2xl">
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
            TODO
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
