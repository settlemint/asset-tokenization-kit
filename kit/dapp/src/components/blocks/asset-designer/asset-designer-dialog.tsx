"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";
import { useTheme } from "next-themes";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AssetDesignerStep, AssetType } from "./types";
import { stepDetailsMap, stepsOrder } from "./types";

// Import step wizard components
import type { Step } from "./step-wizard/step-wizard";
import { StepWizard } from "./step-wizard/step-wizard";

// Import steps
import { AssetTypeSelection } from "./steps/asset-type-selection";
import { AssetBasicsStep } from "./steps/basics";
import { AssetConfigurationStep } from "./steps/configuration";
import { AssetPermissionsStep } from "./steps/permissions";
import { AssetSummaryStep } from "./steps/summary";

// Import utility functions
import { getAssetDescription, getAssetTitle } from "./utils";

// Import custom hook for form management
import { useAssetDesignerForms } from "./hooks/use-asset-designer-forms";

// Import create actions for each asset type
import { createBond } from "@/lib/mutations/bond/create/create-action";
import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import { createEquity } from "@/lib/mutations/equity/create/create-action";
import { createFund } from "@/lib/mutations/fund/create/create-action";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";

// Import the predict address functions
import { getPredictedAddress as getBondPredictedAddress } from "@/lib/queries/bond-factory/bond-factory-predict-address";
import { getPredictedAddress as getCryptocurrencyPredictedAddress } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-predict-address";
import { getPredictedAddress as getDepositPredictedAddress } from "@/lib/queries/deposit-factory/deposit-factory-predict-address";
import { getPredictedAddress as getEquityPredictedAddress } from "@/lib/queries/equity-factory/equity-factory-predict-address";
import { getPredictedAddress as getFundPredictedAddress } from "@/lib/queries/fund-factory/fund-factory-predict-address";
import { getPredictedAddress as getStablecoinPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";

// Import FormOtpDialog
import { FormOtpDialog } from "@/components/blocks/form/inputs/form-otp-dialog";

// Import the waitForTransactions function
import { waitForIndexing } from "@/lib/queries/transactions/wait-for-indexing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { revalidateCaches } from "./revalidate-cache";

interface AssetDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mini progress bar component
interface MiniProgressBarProps {
  totalSteps: number;
  currentStepIndex: number;
}

function MiniProgressBar({
  totalSteps,
  currentStepIndex,
}: MiniProgressBarProps) {
  return (
    <div className="absolute bottom-10 left-[61%] transform -translate-x-1/2 flex justify-center items-center gap-2 pointer-events-none">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`transition-all duration-300 ${
            index === currentStepIndex
              ? "w-4 h-1.5 bg-primary rounded-full animate-pulse"
              : "w-1.5 h-1.5 bg-muted-foreground/30 rounded-full"
          }`}
        />
      ))}
    </div>
  );
}

export function AssetDesignerDialog({
  open,
  onOpenChange,
}: AssetDesignerDialogProps) {
  const [currentStep, setCurrentStep] = useState<AssetDesignerStep>("type");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  // Use the custom hook for form management
  const {
    selectedAssetType,
    setSelectedAssetType,
    getFormForAssetType,
    resetForms,
    isBasicInfoFormValid,
    isConfigurationFormValid,
    isPermissionsFormValid,
    bondForm,
    cryptocurrencyForm,
    equityForm,
    fundForm,
    stablecoinForm,
    depositForm,
  } = useAssetDesignerForms();

  // State for verification dialog
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  // Create a form for the verification code
  const verificationForm = useForm({
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode",
    },
  });

  const handleAssetTypeSelect = (type: AssetType) => {
    setSelectedAssetType(type);

    // Move to the next step after selecting an asset type
    if (type) {
      setCurrentStep("details");
    }
  };

  const resetDesigner = () => {
    setCurrentStep("type");
    setSelectedAssetType(null);
    resetForms();
  };

  // When the dialog is closed, reset the state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDesigner();
    }
    onOpenChange(newOpen);
  };

  // Convert our steps to the format expected by StepWizard
  const wizardSteps: Step[] = stepsOrder.map((stepId) => ({
    id: stepId,
    title: stepDetailsMap[stepId].title,
    description: stepDetailsMap[stepId].description,
  }));

  // Handle asset creation submission
  const handleCreateAsset = async () => {
    if (!selectedAssetType) return;

    setIsSubmitting(true);

    try {
      switch (selectedAssetType) {
        case "bond": {
          const bondFormValues = bondForm.getValues();
          const predictedAddress = await getBondPredictedAddress({
            assetName: bondFormValues.assetName,
            symbol: bondFormValues.symbol,
            decimals: bondFormValues.decimals,
            cap: bondFormValues.cap,
            maturityDate: bondFormValues.maturityDate,
            underlyingAsset: bondFormValues.underlyingAsset,
            faceValue: bondFormValues.faceValue,
          });
          bondForm.setValue("predictedAddress", predictedAddress);
          break;
        }
        case "cryptocurrency": {
          const cryptoFormValues = cryptocurrencyForm.getValues();
          const predictedAddress = await getCryptocurrencyPredictedAddress({
            assetName: cryptoFormValues.assetName,
            symbol: cryptoFormValues.symbol,
            decimals: cryptoFormValues.decimals,
            initialSupply: cryptoFormValues.initialSupply,
          });
          cryptocurrencyForm.setValue("predictedAddress", predictedAddress);
          break;
        }
        case "stablecoin": {
          const stablecoinFormValues = stablecoinForm.getValues();
          const predictedAddress = await getStablecoinPredictedAddress({
            assetName: stablecoinFormValues.assetName,
            symbol: stablecoinFormValues.symbol,
            decimals: stablecoinFormValues.decimals,
            collateralLivenessValue:
              stablecoinFormValues.collateralLivenessValue,
            collateralLivenessTimeUnit:
              stablecoinFormValues.collateralLivenessTimeUnit,
          });
          stablecoinForm.setValue("predictedAddress", predictedAddress);
          break;
        }
        case "deposit": {
          const depositFormValues = depositForm.getValues();
          const predictedAddress = await getDepositPredictedAddress({
            assetName: depositFormValues.assetName,
            symbol: depositFormValues.symbol,
            decimals: depositFormValues.decimals,
            collateralLivenessValue: depositFormValues.collateralLivenessValue,
            collateralLivenessTimeUnit:
              depositFormValues.collateralLivenessTimeUnit,
          });
          depositForm.setValue("predictedAddress", predictedAddress);
          break;
        }
        case "equity": {
          const equityFormValues = equityForm.getValues();
          const predictedAddress = await getEquityPredictedAddress({
            assetName: equityFormValues.assetName,
            symbol: equityFormValues.symbol,
            decimals: equityFormValues.decimals,
            equityCategory: equityFormValues.equityCategory,
            equityClass: equityFormValues.equityClass,
          });
          equityForm.setValue("predictedAddress", predictedAddress);
          break;
        }
        case "fund": {
          const fundFormValues = fundForm.getValues();
          const predictedAddress = await getFundPredictedAddress({
            assetName: fundFormValues.assetName,
            symbol: fundFormValues.symbol,
            decimals: fundFormValues.decimals,
            fundCategory: fundFormValues.fundCategory,
            fundClass: fundFormValues.fundClass,
            managementFeeBps: fundFormValues.managementFeeBps,
          });
          fundForm.setValue("predictedAddress", predictedAddress);
          break;
        }
        default:
          exhaustiveGuard(selectedAssetType);
      }

      setShowVerificationDialog(true);
    } catch (error) {
      console.error("Error preparing asset creation:", error);
      toast.error("Failed to prepare asset creation. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle verification submission
  const handleVerificationSubmit = async () => {
    const toastId = toast.loading(
      `Creating ${selectedAssetType}... This process may take a moment.`
    );
    try {
      // Get the verification code from the form
      const verificationCode = verificationForm.getValues().verificationCode;

      const createAsset = async () => {
        switch (selectedAssetType) {
          case "bond":
            const bondFormValues = bondForm.getValues();
            return createBond({
              ...bondFormValues,
              verificationCode,
              verificationType: "pincode",
            });
          case "cryptocurrency":
            const cryptoFormValues = cryptocurrencyForm.getValues();
            return createCryptoCurrency({
              ...cryptoFormValues,
              verificationCode,
              verificationType: "pincode",
            });
          case "stablecoin":
            const stablecoinFormValues = stablecoinForm.getValues();
            return createStablecoin({
              ...stablecoinFormValues,
              verificationCode,
              verificationType: "pincode",
            });
          case "deposit":
            const depositFormValues = depositForm.getValues();
            return createDeposit({
              ...depositFormValues,
              verificationCode,
              verificationType: "pincode",
            });
          case "equity":
            const equityFormValues = equityForm.getValues();
            return createEquity({
              ...equityFormValues,
              verificationCode,
              verificationType: "pincode",
            });
          case "fund":
            const fundFormValues = fundForm.getValues();
            return createFund({
              ...fundFormValues,
              verificationCode,
              verificationType: "pincode",
            });
          default:
            exhaustiveGuard(selectedAssetType);
        }
      };
      const result = await createAsset();

      if (!result) {
        toast.error("Failed to create asset. Please try again.", {
          id: toastId,
        });
        return;
      }

      if (result.validationErrors) {
        // Update the toast with validation error message
        toast.error(
          "Please fix the validation errors before creating the asset.",
          { id: toastId }
        );
        console.error("Validation errors:", result.validationErrors);
      }

      // Parse the transaction hashes from the response
      const hashes = result.data
        ? Array.isArray(result.data)
          ? result.data
          : [result.data]
        : [];

      // Wait for the transactions to be confirmed using the dedicated function
      const transactions = await waitForTransactions(hashes);
      const lastTransaction = transactions.at(-1);

      if (lastTransaction?.blockNumber) {
        await waitForIndexing(Number(lastTransaction.blockNumber));
      }

      await revalidateCaches();

      toast.success(
        `${selectedAssetType?.charAt(0).toUpperCase() || ""}${selectedAssetType?.slice(1) || ""} was created successfully!`,
        { id: toastId }
      );

      handleOpenChange(false);

      const form = getFormForAssetType();
      const assetId = form.getValues().predictedAddress;

      router.push(`/assets/${selectedAssetType}/${assetId}`);
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      verificationForm.reset();
    }
  };

  // Handle verification dialog close
  const handleVerificationCancel = () => {
    setIsSubmitting(false);
    setShowVerificationDialog(false);
    verificationForm.reset();
  };

  // Conditionally apply the sidebar background style
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
  const currentStepIndex = stepsOrder.findIndex((step) => step === currentStep);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[95vh] min-h-[70vh] h-auto w-[90vw] lg:w-[75vw] p-0 overflow-auto border-none right-0 !max-w-screen rounded-2xl"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <div className="relative">
          <DialogTitle className="sr-only">
            {getAssetTitle(selectedAssetType)}
          </DialogTitle>
          <StepWizard
            steps={wizardSteps}
            currentStepId={currentStep}
            title={getAssetTitle(selectedAssetType)}
            description={getAssetDescription(selectedAssetType)}
            onStepChange={(stepId) =>
              setCurrentStep(stepId as AssetDesignerStep)
            }
            sidebarStyle={sidebarStyle}
            onClose={() => handleOpenChange(false)}
          >
            {/* Type Selection Step */}
            {currentStep === "type" && (
              <AssetTypeSelection
                selectedType={selectedAssetType}
                onSelect={handleAssetTypeSelect}
              />
            )}

            {/* Basics Step */}
            {currentStep === "details" && selectedAssetType && (
              <AssetBasicsStep
                assetType={selectedAssetType}
                form={getFormForAssetType()}
                isValid={isBasicInfoFormValid}
                onBack={() => setCurrentStep("type")}
                onNext={() => setCurrentStep("configuration")}
              />
            )}

            {/* Configuration Step */}
            {currentStep === "configuration" && selectedAssetType && (
              <AssetConfigurationStep
                assetType={selectedAssetType}
                form={getFormForAssetType()}
                isValid={isConfigurationFormValid}
                onBack={() => setCurrentStep("details")}
                onNext={() => setCurrentStep("permissions")}
              />
            )}

            {/* Permissions Step */}
            {currentStep === "permissions" && selectedAssetType && (
              <AssetPermissionsStep
                assetType={selectedAssetType}
                form={getFormForAssetType()}
                isValid={isPermissionsFormValid}
                onBack={() => setCurrentStep("configuration")}
                onNext={() => setCurrentStep("summary")}
              />
            )}

            {/* TODO: bring back later */}
            {/* Regulation Step */}
            {/* {currentStep === "regulation" && selectedAssetType && (
              <AssetRegulationStep
                assetType={selectedAssetType}
                form={getFormForAssetType()}
                onBack={() => setCurrentStep("permissions")}
                onNext={() => setCurrentStep("summary")}
              />
            )} */}

            {/* Summary Step */}
            {currentStep === "summary" && selectedAssetType && (
              <AssetSummaryStep
                assetType={selectedAssetType}
                form={getFormForAssetType()}
                isSubmitting={isSubmitting}
                onBack={() => setCurrentStep("permissions")}
                onSubmit={handleCreateAsset}
              />
            )}
          </StepWizard>

          {/* Mini progress bar */}
          <MiniProgressBar
            totalSteps={stepsOrder.length}
            currentStepIndex={currentStepIndex}
          />
        </div>
      </DialogContent>

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
        />
      </FormProvider>
    </Dialog>
  );
}
