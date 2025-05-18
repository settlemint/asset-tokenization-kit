"use client";

import MiniProgressBar from "@/components/blocks/step-wizard/mini-progress-bar";
import { StepContent } from "@/components/blocks/step-wizard/step-content";
import {
  StepWizard,
  type Step,
} from "@/components/blocks/step-wizard/step-wizard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { User } from "better-auth";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AssetTypeSelection } from "./steps/asset-type-selection";
import {
  assetForms,
  typeSelectionStep,
  type AssetFormDefinition,
} from "./types";
import { getAssetDescription, getAssetTitle } from "./utils";

interface AssetDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
}

export function AssetDesignerDialog({
  currentUser,
  open,
  onOpenChange,
}: AssetDesignerDialogProps) {
  const t = useTranslations("private.assets.create");
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(
    null
  );
  const [currentStepId, setCurrentStepId] = useState<string>("type");
  const [assetForm, setAssetForm] = useState<AssetFormDefinition | null>(null);
  const [formComponent, setFormComponent] =
    useState<React.ComponentType<any> | null>(null);

  // Create a unified representation of all steps
  const allSteps: Step[] = [
    {
      ...typeSelectionStep,
      description: t(typeSelectionStep.description),
      title: t(typeSelectionStep.title),
    },
    ...(assetForm?.steps.map((step) => ({
      ...step,
      description: t(step.description),
      title: t(step.title),
    })) || []),
  ].filter((step) => step.id === "type" || selectedAssetType !== null);

  // Derive stepsOrder from allSteps for navigation
  const stepsOrder = allSteps.map((step) => step.id);

  // Reset form state when dialog is closed
  useEffect(() => {
    if (!open) {
      setSelectedAssetType(null);
      setCurrentStepId("type");
      setAssetForm(null);
      setFormComponent(null);
    }
  }, [open]);

  // Load asset form definition and form component when type changes
  useEffect(() => {
    if (!selectedAssetType) {
      setAssetForm(null);
      setFormComponent(null);
      return;
    }

    // Load the form definition
    assetForms[selectedAssetType]()
      .then((module) => {
        setAssetForm(module.default);

        // Auto-navigate to first step of the loaded form
        if (module.default.steps.length > 0 && currentStepId === "type") {
          setCurrentStepId(module.default.steps[0].id);
        }

        // Load the appropriate form component based on asset type
        if (selectedAssetType === "bond") {
          import("../create-forms/bond/form").then((module) => {
            setFormComponent(() => module.CreateBondForm);
          });
        } else if (selectedAssetType === "cryptocurrency") {
          import("../create-forms/cryptocurrency/form").then((module) => {
            setFormComponent(() => module.CreateCryptoCurrencyForm);
          });
        } else if (selectedAssetType === "deposit") {
          import("../create-forms/deposit/form").then((module) => {
            setFormComponent(() => module.CreateDepositForm);
          });
        } else if (selectedAssetType === "equity") {
          import("../create-forms/equity/form").then((module) => {
            setFormComponent(() => module.CreateEquityForm);
          });
        } else if (selectedAssetType === "fund") {
          import("../create-forms/fund/form").then((module) => {
            setFormComponent(() => module.CreateFundForm);
          });
        } else if (selectedAssetType === "stablecoin") {
          import("../create-forms/stablecoin/form").then((module) => {
            setFormComponent(() => module.CreateStablecoinForm);
          });
        }
      })
      .catch((error) => {
        console.error("Failed to load asset form:", error);
      });
  }, [selectedAssetType, currentStepId]);

  // Handler for asset type selection
  const handleAssetTypeSelect = (type: AssetType) => {
    if (type !== selectedAssetType) {
      setSelectedAssetType(type);
    }
  };

  // Navigation helpers
  const handleStepChange = (stepId: string) => {
    // If navigating to type selection, reset asset type
    if (stepId === "type" && currentStepId !== "type") {
      setSelectedAssetType(null);
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

    // If we're at the first step of an asset form, go back to type selection
    if (currentIndex === 1) {
      setCurrentStepId("type");
      setSelectedAssetType(null);
      return;
    }

    // Otherwise go to the previous step
    if (currentIndex > 0) {
      setCurrentStepId(stepsOrder[currentIndex - 1]);
    }
  }, [currentStepId, stepsOrder]);

  // Get current step index for the progress bar
  const currentStepIndex = stepsOrder.indexOf(currentStepId);

  // Simplified step content rendering with verification wrapper
  const renderStepContent = () => {
    // Type selection step
    if (currentStepId === "type") {
      return (
        <StepContent>
          <AssetTypeSelection
            selectedType={selectedAssetType}
            onSelect={handleAssetTypeSelect}
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
          <DialogTitle className="sr-only">Asset Designer</DialogTitle>
          <StepWizard
            steps={allSteps}
            currentStepId={currentStepId}
            title={t(getAssetTitle(selectedAssetType))}
            description={t(getAssetDescription(selectedAssetType))}
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
