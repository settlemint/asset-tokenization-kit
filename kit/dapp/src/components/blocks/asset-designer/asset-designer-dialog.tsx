"use client";

import { FormOtpDialog } from "@/components/blocks/form/inputs/form-otp-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";
import { waitForIndexing } from "@/lib/queries/transactions/wait-for-indexing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { revalidate } from "@/lib/utils/revalidate";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { User } from "better-auth";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
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
  const router = useRouter();

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

  // Verification form
  const verificationForm = useForm({
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode",
    },
  });

  /**
   * Asset Creation Flow:
   * 1. User fills out the form in the asset-specific form component
   * 2. When they click submit, this wrapper intercepts the submission
   * 3. Instead of submitting right away, it stores the form data and shows the verification dialog
   * 4. After verification code is entered, handleVerificationSubmit is called
   * 5. That function submits the form with the verification code included
   * 6. It processes the response (waiting for transactions, redirecting, etc.)
   */

  // Function to wrap submission with verification
  // This accepts any function that returns a result (like transaction hashes)
  const verificationWrapper = <T,>(submitFn: (data: any) => Promise<T>) => {
    return async (data: any): Promise<void> => {
      // Store the form data and open verification dialog
      setVerifiedFormData({ data, onSubmit: submitFn });
      setShowVerificationDialog(true);
    };
  };

  // Handle verification submission
  const handleVerificationSubmit = async () => {
    const toastId = toast.loading(t("form.toasts.submitting"));

    const assetId = verifiedFormData.data.predictedAddress;
    const verificationCode = verificationForm.getValues("verificationCode");

    try {
      // Call the form's submit function with verification code
      // The specific asset form (stablecoin, bond, etc.) handles its own form submission
      // and returns the result which contains transaction hashes
      const result = await verifiedFormData.onSubmit({
        ...verifiedFormData.data,
        verificationCode,
        verificationType: "pincode",
      });

      // Handle case when result is falsy
      if (!result) {
        toast.error(t("form.toasts.failed"), { id: toastId });
        return;
      }

      // Safe-action results have a specific format: { data?, validationErrors?, serverError? }
      // For our transaction responses, data contains the transaction hash(es)

      // Handle server errors if any
      if (result.serverError) {
        toast.error(result.serverError, { id: toastId });
        return;
      }

      // Handle validation errors if any
      if (result.validationErrors) {
        // Get the first validation error message or use a default
        const errorMessages = Object.values(result.validationErrors);
        const errorMessage =
          errorMessages.length > 0
            ? String(errorMessages[0])
            : t("form.errors.validation-failed");

        toast.error(errorMessage, { id: toastId });
        console.error("Validation errors:", result.validationErrors);
        return;
      }

      // Parse the transaction hashes from the response
      const hashes = result.data
        ? Array.isArray(result.data)
          ? result.data
          : [result.data]
        : [];

      if (!hashes.length) {
        toast.error(t("form.toasts.failed"), { id: toastId });
        return;
      }

      // Wait for the transactions to be confirmed and indexed
      // This ensures the created asset is available in the database
      const receipts = await waitForTransactions(hashes);
      const lastBlockNumber = Number(receipts.at(-1)?.blockNumber);

      if (lastBlockNumber) {
        await waitForIndexing(lastBlockNumber);
        await revalidate();
      }

      // Only show success toast if we got this far
      toast.success(t("form.toasts.success"), { id: toastId });
      onOpenChange(false);

      // Redirect to the newly created asset page
      router.push(`/assets/${selectedAssetType}/${assetId}`);
    } catch (error) {
      console.error("Error during form submission:", error);

      // Display a more specific error message if possible
      const errorMessage =
        error instanceof Error ? error.message : t("form.toasts.failed");

      toast.error(errorMessage, { id: toastId });
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
          verificationWrapper={verificationWrapper}
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
