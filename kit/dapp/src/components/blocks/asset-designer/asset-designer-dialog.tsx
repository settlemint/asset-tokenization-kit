"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { User } from "@/lib/queries/user/user-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { UserRole } from "@/lib/utils/typebox/user-roles";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import MiniProgressBar from "./components/mini-progress-bar";
import { StepContent } from "./step-wizard/step-content";
import type { Step } from "./step-wizard/step-wizard";
import { StepWizard } from "./step-wizard/step-wizard";
import { AssetTypeSelection } from "./steps/asset-type-selection";
import {
  assetForms,
  typeSelectionStep,
  type AssetFormDefinition,
} from "./types";
import { getAssetDescription } from "./utils";

// Navigation types to help track intended navigation direction
type NavigationType =
  | "INITIAL"
  | "ASSET_TYPE_SELECTED"
  | "NEXT_STEP"
  | "PREVIOUS_STEP"
  | "DIRECT_NAVIGATION";

interface AssetDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDesignerDialog({
  open,
  onOpenChange,
}: AssetDesignerDialogProps) {
  const { theme } = useTheme();
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(
    null
  );
  const [currentStepId, setCurrentStepId] = useState<string>("type");
  const [assetForm, setAssetForm] = useState<AssetFormDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [formComponent, setFormComponent] =
    useState<React.ComponentType<any> | null>(null);

  // Track the last navigation action to help resolve race conditions
  const [navigationType, setNavigationType] =
    useState<NavigationType>("INITIAL");

  // Skip automatic navigation when going back to type selection
  const skipNextTypeNavigation = useRef(false);

  // Placeholder user for development
  const placeholderUser: User = {
    id: "1",
    email: "user@example.com",
    name: "Demo User",
    wallet: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    created_at: new Date(),
    role: "user" as UserRole,
    currency: "EUR",
    banned: null,
    ban_reason: null,
    ban_expires: null,
    image: null,
    kyc_verified_at: null,
    last_login_at: undefined,
    updated_at: undefined,
  };

  // Load asset form definition and form component when type changes
  useEffect(() => {
    if (!selectedAssetType) {
      setAssetForm(null);
      setFormComponent(null);
      return;
    }

    setLoading(true);
    // Load the form definition
    assetForms[selectedAssetType]()
      .then((module) => {
        setAssetForm(module.default);

        // For bond type, also load the CreateBondForm component
        if (selectedAssetType === "bond") {
          import("../create-forms/bond/form").then((module) => {
            setFormComponent(() => module.CreateBondForm);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load asset form:", error);
        setLoading(false);
      });
  }, [selectedAssetType]);

  // Handle navigation based on form loading and navigation type
  useEffect(() => {
    // Skip navigation if we just went back to type selection
    if (skipNextTypeNavigation.current && currentStepId === "type") {
      skipNextTypeNavigation.current = false;
      return;
    }

    // Auto-navigate to first step when asset type is selected
    if (
      navigationType === "ASSET_TYPE_SELECTED" &&
      assetForm &&
      currentStepId === "type"
    ) {
      if (assetForm.steps.length > 0) {
        setCurrentStepId(assetForm.steps[0].id);
        setNavigationType("DIRECT_NAVIGATION");
      }
    }
  }, [assetForm, currentStepId, navigationType]);

  // Combine the type selection step with asset-specific steps
  const stepsOrder = [
    "type",
    ...(assetForm?.steps.map((step) => step.id) || []),
  ];

  // Convert our steps to the format expected by StepWizard
  const wizardSteps: Step[] = [
    typeSelectionStep,
    ...(assetForm?.steps || []),
  ].filter((step) => step.id === "type" || selectedAssetType !== null);

  // Helper function to get the next step ID
  const getNextStepId = (currentId: string): string | null => {
    const currentIndex = stepsOrder.indexOf(currentId);
    if (currentIndex >= 0 && currentIndex < stepsOrder.length - 1) {
      return stepsOrder[currentIndex + 1];
    }
    return null;
  };

  // Helper function to get the previous step ID
  const getPreviousStepId = (currentId: string): string | null => {
    const currentIndex = stepsOrder.indexOf(currentId);
    if (currentIndex > 0) {
      return stepsOrder[currentIndex - 1];
    }
    return null;
  };

  // Handler for asset type selection
  const handleAssetTypeSelect = (type: AssetType) => {
    if (type !== selectedAssetType) {
      setSelectedAssetType(type);
      setNavigationType("ASSET_TYPE_SELECTED");
    }
  };

  // Handler for step change
  const handleStepChange = (stepId: string) => {
    // Always allow navigating to the type selection step
    if (stepId === "type") {
      setCurrentStepId(stepId);
      setNavigationType("DIRECT_NAVIGATION");
      return;
    }

    // Only allow navigating to other steps if an asset type is selected
    if (selectedAssetType !== null) {
      setCurrentStepId(stepId);
      setNavigationType("DIRECT_NAVIGATION");
    }
  };

  // Handler for next step
  const handleNextStep = () => {
    const nextStepId = getNextStepId(currentStepId);
    if (nextStepId) {
      setCurrentStepId(nextStepId);
      setNavigationType("NEXT_STEP");
    }
  };

  // Handler for previous step
  const handlePreviousStep = () => {
    // If we're at the first step of an asset form, go back to type selection
    if (
      assetForm &&
      assetForm.steps.length > 0 &&
      assetForm.steps[0].id === currentStepId
    ) {
      // Set a flag to skip the auto-navigation in the useEffect
      skipNextTypeNavigation.current = true;

      // Reset to initial state when going back to type selection
      setCurrentStepId("type");
      setSelectedAssetType(null); // Clear the selected asset type
      setNavigationType("PREVIOUS_STEP");
      return;
    }

    // Otherwise, go to the previous step
    const previousStepId = getPreviousStepId(currentStepId);
    if (previousStepId) {
      setCurrentStepId(previousStepId);
      setNavigationType("PREVIOUS_STEP");
    }
  };

  // Conditional sidebar style
  const sidebarStyle = {
    backgroundImage:
      theme === "dark"
        ? "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('/backgrounds/sidebar-bg.png')"
        : "url('/backgrounds/sidebar-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "top",
    backgroundRepeat: "no-repeat",
  };

  // Get current step index for the progress bar
  const currentStepIndex = stepsOrder.indexOf(currentStepId);

  // Render step content
  const renderStepContent = () => {
    // Type selection step is handled directly
    if (currentStepId === "type") {
      return (
        <StepContent showNextButton={false} showBackButton={false}>
          <AssetTypeSelection
            selectedType={selectedAssetType}
            onSelect={handleAssetTypeSelect}
          />
        </StepContent>
      );
    }

    // For asset-specific steps, render the form component
    if (assetForm && formComponent) {
      const FormComponent = formComponent;

      return (
        <StepContent
          showNextButton={currentStepId !== "review"}
          showBackButton={true}
          onNext={handleNextStep}
          onBack={handlePreviousStep}
        >
          <FormComponent
            userDetails={placeholderUser}
            currentStepId={currentStepId}
          />
        </StepContent>
      );
    }

    // Loading or fallback
    return loading ? (
      <StepContent
        showNextButton={false}
        showBackButton={true}
        onBack={handlePreviousStep}
      >
        <div className="flex justify-center items-center min-h-[300px]">
          Loading...
        </div>
      </StepContent>
    ) : (
      <StepContent
        showNextButton={false}
        showBackButton={true}
        onBack={handlePreviousStep}
      >
        <p>Step {currentStepId} content will be implemented soon</p>
      </StepContent>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95vh] min-h-[70vh] h-auto w-[90vw] lg:w-[75vw] p-0 overflow-auto border-none right-0 !max-w-screen rounded-2xl"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <div className="relative">
          <DialogTitle className="sr-only">Asset Designer</DialogTitle>
          <StepWizard
            steps={wizardSteps}
            currentStepId={currentStepId}
            title="Create Digital Asset"
            description={getAssetDescription(selectedAssetType)}
            onStepChange={handleStepChange}
            sidebarStyle={sidebarStyle}
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
