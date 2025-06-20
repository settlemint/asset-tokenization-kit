"use client";

import MiniProgressBar from "@/components/blocks/step-wizard/mini-progress-bar";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import {
  StepWizard,
  type Step,
} from "@/components/blocks/step-wizard/step-wizard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { User } from "@/lib/auth/types";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AirdropTypeSelection } from "./steps/airdrop-type-selection";
import { airdropForms, type AirdropFormDefinition } from "./types";
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
  const [airdropForm, setAirdropForm] = useState<AirdropFormDefinition | null>(
    null
  );
  const [formComponent, setFormComponent] =
    useState<React.ComponentType<any> | null>(null);

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
      setFormComponent(null);
    }
  }, [open]);

  useEffect(() => {
    if (!selectedAirdropType) {
      setAirdropForm(null);
      setFormComponent(null);
      return;
    }

    // Load the form definition
    airdropForms[selectedAirdropType]()
      .then((module) => {
        setAirdropForm(module.default);

        // Auto-navigate to first step of the loaded form
        if (module.default.steps.length > 0 && currentStepId === "type") {
          setCurrentStepId(module.default.steps[0].id);
        }

        // Load the appropriate form component based on airdrop type
        const loadFormComponent = async () => {
          try {
            switch (selectedAirdropType) {
              case "standard":
                const standardModule = await import(
                  "./create-forms/standard-airdrop/form"
                );
                setFormComponent(
                  () => standardModule.CreateStandardAirdropForm
                );
                break;
              case "vesting":
                const vestingModule = await import(
                  "./create-forms/vesting-airdrop/form"
                );
                setFormComponent(() => vestingModule.CreateVestingAirdropForm);
                break;
              case "push":
                const pushModule = await import(
                  "./create-forms/push-airdrop/form"
                );
                setFormComponent(() => pushModule.CreatePushAirdropForm);
                break;
              default:
                exhaustiveGuard(selectedAirdropType);
            }
          } catch (error) {
            console.error(
              `Failed to load ${selectedAirdropType} airdrop form:`,
              error
            );
          }
        };

        loadFormComponent();
      })
      .catch((error) => {
        console.error("Failed to load airdrop form:", error);
      });
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
    if (currentStepId === "type") {
      return (
        <StepContent>
          <AirdropTypeSelection
            selectedType={selectedAirdropType}
            onSelect={handleAirdropTypeSelect}
          />
        </StepContent>
      );
    }

    if (formComponent) {
      const FormComponent = formComponent;
      return (
        <FormComponent
          userDetails={currentUser}
          currentStepId={currentStepId}
          onNextStep={handleNextStep}
          onPrevStep={handlePreviousStep}
          onOpenChange={onOpenChange}
        />
      );
    }
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
