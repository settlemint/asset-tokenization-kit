"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { User } from "@/lib/queries/user/user-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { UserRole } from "@/lib/utils/typebox/user-roles";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
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
import { getAssetDescription, getAssetTitle } from "./utils";

interface AssetDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDesignerDialog({
  open,
  onOpenChange,
}: AssetDesignerDialogProps) {
  const t = useTranslations("private.assets.create");
  const { theme } = useTheme();
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(
    null
  );
  const [currentStepId, setCurrentStepId] = useState<string>("type");
  const [assetForm, setAssetForm] = useState<AssetFormDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [formComponent, setFormComponent] =
    useState<React.ComponentType<any> | null>(null);

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

  // Create a unified representation of all steps
  const allSteps: Step[] = [
    typeSelectionStep,
    ...(assetForm?.steps || []),
  ].filter((step) => step.id === "type" || selectedAssetType !== null);

  // Derive stepsOrder from allSteps for navigation
  const stepsOrder = allSteps.map((step) => step.id);

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

        // Auto-navigate to first step of the loaded form
        if (module.default.steps.length > 0 && currentStepId === "type") {
          setCurrentStepId(module.default.steps[0].id);
        }

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

  // Simplified step content rendering
  const renderStepContent = () => {
    // Type selection step
    if (currentStepId === "type") {
      return (
        <StepContent
          showNextButton={!!selectedAssetType}
          showBackButton={false}
          onNext={handleNextStep}
          isNextDisabled={!selectedAssetType}
        >
          <AssetTypeSelection
            selectedType={selectedAssetType}
            onSelect={handleAssetTypeSelect}
          />
        </StepContent>
      );
    }

    // Form steps with component
    if (formComponent) {
      const FormComponent = formComponent;
      return (
        <FormComponent
          userDetails={placeholderUser}
          currentStepId={currentStepId}
          onNextStep={handleNextStep}
          onPrevStep={handlePreviousStep}
        />
      );
    }

    // Loading state
    if (loading) {
      return (
        <StepContent
          showNextButton={false}
          showBackButton={true}
          onBack={handlePreviousStep}
        >
          <div className="flex justify-center items-center min-h-[300px]">
            Loading...
          </div>
        </StepContent>
      );
    }

    // Fallback for future steps
    return (
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
          {/* Using 'as any' type assertions because dynamic translation keys from getAssetTitle/getAssetDescription
              don't match the literal string types expected by next-intl's t function */}
          <StepWizard
            steps={allSteps}
            currentStepId={currentStepId}
            title={t(getAssetTitle(selectedAssetType) as any)}
            description={t(getAssetDescription(selectedAssetType) as any)}
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
