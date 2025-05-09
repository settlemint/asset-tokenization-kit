"use client";

import { FormOtpDialog } from "@/components/blocks/form/inputs/form-otp-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { User } from "better-auth";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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
  currentUser: User;
}

export function AssetDesignerDialog({
  currentUser,
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
  const [formComponent, setFormComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verifiedFormData, setVerifiedFormData] = useState<any>(null);

  // Create a unified representation of all steps
  const allSteps: Step[] = [
    typeSelectionStep,
    ...(assetForm?.steps || []),
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
      setVerifiedFormData(null);
      setShowVerificationDialog(false);
      verificationForm.reset();
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

  // Verification form (already defined in your code)
  const verificationForm = useForm({
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode",
    },
  });

  // Function to wrap submission with verification
  const wrapWithVerification = (submitFn: (data: any) => Promise<void>) => {
    console.log("Creating verification wrapper for submit function");
    return async (data: any) => {
      console.log("Verification wrapper called with data:", data);
      // Store the form data and open verification dialog
      setVerifiedFormData({ data, onSubmit: submitFn });
      setShowVerificationDialog(true);
    };
  };

  // Handle verification submission
  const handleVerificationSubmit = async () => {
    console.log("Verification submitted, verifiedFormData:", verifiedFormData);
    if (verifiedFormData && formComponent) {
      const verificationCode = verificationForm.getValues("verificationCode");
      console.log("Using verification code:", verificationCode);
      // Call the form's submit function with verification code
      await verifiedFormData.onSubmit({
        ...verifiedFormData.data,
        verificationCode,
        verificationType: "pincode",
      });

      // Reset the verification dialog state
      setShowVerificationDialog(false);
      setVerifiedFormData(null);
      verificationForm.reset();
    } else {
      console.error(
        "Missing verifiedFormData or formComponent for verification"
      );
    }
  };

  // Handle verification cancellation
  const handleVerificationCancel = () => {
    setShowVerificationDialog(false);
    setVerifiedFormData(null);
    verificationForm.reset();
  };

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

  // Simplified step content rendering with verification wrapper
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

    // Wrap form component's submit with verification
    if (formComponent) {
      const FormComponent = formComponent;
      return (
        <FormComponent
          userDetails={currentUser}
          currentStepId={currentStepId}
          onNextStep={handleNextStep}
          onPrevStep={handlePreviousStep}
          withVerification={wrapWithVerification}
        />
      );
    }
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
          {/* TODO: Using 'as any' type assertions because dynamic translation keys from getAssetTitle/getAssetDescription
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

          {/* Verification dialog */}
          <FormProvider {...verificationForm}>
            <FormOtpDialog
              name="verificationCode"
              open={showVerificationDialog}
              onOpenChange={(open: boolean) => {
                if (!open) handleVerificationCancel();
                else setShowVerificationDialog(open);
              }}
              onSubmit={handleVerificationSubmit}
              control={verificationForm.control}
            />
          </FormProvider>

          <MiniProgressBar
            totalSteps={stepsOrder.length}
            currentStepIndex={currentStepIndex}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
