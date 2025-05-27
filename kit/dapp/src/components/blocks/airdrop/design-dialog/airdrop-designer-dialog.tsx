"use client";

import MiniProgressBar from "@/components/blocks/step-wizard/mini-progress-bar";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import {
  StepWizard,
  type Step,
} from "@/components/blocks/step-wizard/step-wizard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import type { User } from "better-auth";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  CreatePushAirdropForm,
  type pushAirdropFormDefinition,
} from "./create-forms/push-airdrop/form";
import {
  CreateStandardAirdropForm,
  type standardAirdropFormDefinition,
} from "./create-forms/standard-airdrop/form";
import {
  CreateVestingAirdropForm,
  type vestingAirdropFormDefinition,
} from "./create-forms/vesting-airdrop/form";
import { AirdropTypeSelection } from "./steps/airdrop-type-selection";
import { airdropForms } from "./types";
import { getAirdropDescription, getAirdropTitle } from "./utils";

interface AirdropDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
}

export function AirdropDesignerDialog({
  currentUser,
  open,
  onOpenChange,
}: AirdropDesignerDialogProps) {
  const t = useTranslations("private.airdrops.create");
  const [selectedAirdropType, setSelectedAirdropType] =
    useState<AirdropType | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>("type");
  const [airdropForm, setAirdropForm] = useState<
    | typeof vestingAirdropFormDefinition
    | typeof standardAirdropFormDefinition
    | typeof pushAirdropFormDefinition
    | null
  >(null);

  const allSteps: Step[] = [
    {
      id: "type",
      title: "type-selection.general.title" as const,
      description: "type-selection.general.description" as const,
    },
    ...(airdropForm?.steps || []),
  ].map((step) => ({
    ...step,
    title: t(step.title),
    description: t(step.description),
  }));

  const stepsOrder = allSteps.map((step) => step.id);

  useEffect(() => {
    if (!open) {
      setSelectedAirdropType(null);
      setCurrentStepId("type");
      setAirdropForm(null);
    }
  }, [open]);

  useEffect(() => {
    if (!selectedAirdropType) {
      setAirdropForm(null);
      return;
    }

    setAirdropForm(airdropForms[selectedAirdropType]);
    if (
      airdropForms[selectedAirdropType].steps.length > 0 &&
      currentStepId === "type"
    ) {
      setCurrentStepId(airdropForms[selectedAirdropType].steps[0].id);
    }
  }, [selectedAirdropType, currentStepId]);

  const handleAirdropTypeSelect = (type: AirdropType) => {
    if (type !== selectedAirdropType) {
      setSelectedAirdropType(type);
      // Don't auto-navigate here, useEffect will handle it
    }
  };

  const handleStepChange = (stepId: string) => {
    if (stepId === "type" && currentStepId !== "type") {
      setSelectedAirdropType(null); // Reset type if navigating back to type selection
    }
    setCurrentStepId(stepId);
  };

  const handleNextStep = useCallback(() => {
    const currentIndex = stepsOrder.indexOf(currentStepId);
    if (currentIndex >= 0 && currentIndex < stepsOrder.length - 1) {
      setCurrentStepId(stepsOrder[currentIndex + 1]);
    }
  }, [currentStepId, stepsOrder]);

  const handlePreviousStep = useCallback(() => {
    const currentIndex = stepsOrder.indexOf(currentStepId);
    if (currentIndex === 1) {
      // If on the first step of a form, go back to type selection
      setCurrentStepId("type");
      setSelectedAirdropType(null);
      return;
    }
    if (currentIndex > 0) {
      setCurrentStepId(stepsOrder[currentIndex - 1]);
    }
  }, [currentStepId, stepsOrder]);

  const currentStepIndex = stepsOrder.indexOf(currentStepId);

  const renderStepContent = () => {
    if (!selectedAirdropType) {
      return (
        <StepContent>
          <AirdropTypeSelection
            selectedType={selectedAirdropType}
            onSelect={handleAirdropTypeSelect}
          />
        </StepContent>
      );
    }

    const getFormComponent = () => {
      switch (selectedAirdropType) {
        case "standard":
          return CreateStandardAirdropForm;
        case "vesting":
          return CreateVestingAirdropForm;
        case "push":
          return CreatePushAirdropForm;
        default:
          exhaustiveGuard(selectedAirdropType);
      }
    };
    const FormComponent = getFormComponent();
    return (
      <FormComponent
        userDetails={currentUser}
        currentStepId={currentStepId}
        onNextStep={handleNextStep}
        onPrevStep={handlePreviousStep}
        onOpenChange={onOpenChange}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[85vh] w-[90vw] lg:w-[75vw] border-none !max-w-screen rounded-2xl overflow-hidden p-0 m-0"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <div className="h-full">
          <DialogTitle className="sr-only">Airdrop Designer</DialogTitle>
          <StepWizard
            steps={allSteps}
            currentStepId={currentStepId}
            title={t(getAirdropTitle(selectedAirdropType))}
            description={t(getAirdropDescription(selectedAirdropType))}
            onStepChange={handleStepChange}
            onClose={() => onOpenChange(false)}
          >
            {renderStepContent()}
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
