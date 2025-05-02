"use client";

<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadToStorage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Import form steps for each asset type
import { Basics as BondBasics } from "@/components/blocks/create-forms/bond/steps/basics";
import { Basics as CryptocurrencyBasics } from "@/components/blocks/create-forms/cryptocurrency/steps/basics";
import { Basics as DepositBasics } from "@/components/blocks/create-forms/deposit/steps/basics";
import { Basics as EquityBasics } from "@/components/blocks/create-forms/equity/steps/basics";
import { Basics as FundBasics } from "@/components/blocks/create-forms/fund/steps/basics";
import { Basics as StablecoinBasics } from "@/components/blocks/create-forms/stablecoin/steps/basics";

// Import configuration components
import { Configuration as BondConfiguration } from "@/components/blocks/create-forms/bond/steps/configuration";
import { Configuration as CryptocurrencyConfiguration } from "@/components/blocks/create-forms/cryptocurrency/steps/configuration";
import { Configuration as DepositConfiguration } from "@/components/blocks/create-forms/deposit/steps/configuration";
import { Configuration as EquityConfiguration } from "@/components/blocks/create-forms/equity/steps/configuration";
import { Configuration as FundConfiguration } from "@/components/blocks/create-forms/fund/steps/configuration";
import { Configuration as StablecoinConfiguration } from "@/components/blocks/create-forms/stablecoin/steps/configuration";

// Import Permission components
import { AssetAdmins } from "@/components/blocks/create-forms/common/asset-admins/asset-admins";

// Import Form Provider
=======
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "@/i18n/routing";
import { useTheme } from "next-themes";
import { useState } from "react";
>>>>>>> d02f46f1 (feat: new asset design UI iteration 2 (#1744))
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AssetDesignerStep, AssetType, VerificationData } from "./types";
import { stepDetailsMap, stepsOrder } from "./types";

// Import step wizard components
import type { Step } from "./step-wizard/step-wizard";
import { StepWizard } from "./step-wizard/step-wizard";

// Import steps
import { AssetTypeSelection } from "./steps/asset-type-selection";
import { AssetBasicsStep } from "./steps/basics";
import { AssetConfigurationStep } from "./steps/configuration";
import { AssetPermissionsStep } from "./steps/permissions";
import { AssetRegulationStep } from "./steps/regulation";
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
import { getPredictedAddress as getStablecoinPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";
import { getTomorrowMidnight } from "@/lib/utils/date";

<<<<<<< HEAD
// Define a base form type that contains all possible fields
interface _BaseFormValues {
  assetName: string;
  symbol: string;
  decimals?: number;
  isin?: string;
  cusip?: string;
  assetAdmins: string[];
  selectedRegulations: string[];
  // Add other possible fields here
}
=======
// Import FormOtpDialog
import { FormOtpDialog } from "@/components/blocks/form/inputs/form-otp-dialog";
>>>>>>> d02f46f1 (feat: new asset design UI iteration 2 (#1744))

// Import the waitForTransactions function
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";

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
<<<<<<< HEAD
  const _t = useTranslations("admin.sidebar");
=======
>>>>>>> d02f46f1 (feat: new asset design UI iteration 2 (#1744))
  const [currentStep, setCurrentStep] = useState<AssetDesignerStep>("type");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
<<<<<<< HEAD
  const { data: _session } = authClient.useSession();

  // Form state tracking
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(false);
  const [isConfigurationValid, setIsConfigurationValid] = useState(false);
  const [_isPermissionsValid, setIsPermissionsValid] = useState(false);
  const [_isRegulationValid, _setIsRegulationValid] = useState(true); // Default to true since it's optional
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Document upload state
  const [dialogOpen, setDialogOpen] = useState<string | null>(null); // Stores regulation ID for which dialog is open
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [documentDescription, setDocumentDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<
      string,
      {
        id: string;
        name: string;
        title: string;
        type: string;
        description: string;
        url?: string;
      }[]
    >
  >({});
=======
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
  } = useAssetDesignerForms();
>>>>>>> d02f46f1 (feat: new asset design UI iteration 2 (#1744))

  // State for verification dialog
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [pincodeVerificationData, setPincodeVerificationData] =
    useState<VerificationData | null>(null);

  // Create a form for the verification code
  const verificationForm = useForm({
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode",
    },
  });

<<<<<<< HEAD
  // Create forms for each asset type with mode set to run validation always
  const bondForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      isin: "",
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all", // Validate on all events
  });

  const cryptocurrencyForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const equityForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      cusip: "",
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const fundForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const stablecoinForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const depositForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  // Get the appropriate form based on asset type
  const getFormForAssetType = useCallback(() => {
    switch (selectedAssetType) {
      case "bond":
        return bondForm;
      case "cryptocurrency":
        return cryptocurrencyForm;
      case "equity":
        return equityForm;
      case "fund":
        return fundForm;
      case "stablecoin":
        return stablecoinForm;
      case "deposit":
        return depositForm;
      default:
        return bondForm; // Fallback
    }
  }, [
    selectedAssetType,
    bondForm,
    cryptocurrencyForm,
    equityForm,
    fundForm,
    stablecoinForm,
    depositForm,
  ]);

  // Check if all required fields are filled and valid for the current step
  useEffect(() => {
    if (!selectedAssetType) return;

    const checkFormValidity = async () => {
      const form = getFormForAssetType();

      // Get form state
      const { errors } = form.formState;

      if (currentStep === "details") {
        // Mark all fields as touched to force validation
        form.trigger();

        // For the details step, check specific required fields
        const formValues = form.getValues();
        const hasAssetName = !!(formValues as any).assetName;
        const hasSymbol = !!(formValues as any).symbol;
        const hasValidDecimals =
          typeof (formValues as any).decimals === "number" &&
          (formValues as any).decimals > 0;

        // Check if any fields have errors
        const hasErrors = Object.keys(errors).length > 0;

        // Form is valid only if all required fields have values and there are no errors
        const isValid =
          hasAssetName && hasSymbol && hasValidDecimals && !hasErrors;
        setIsBasicInfoValid(isValid);
      }

      if (currentStep === "configuration") {
        // Mark all fields as touched to force validation
        form.trigger();

        // Get form values and check specific required fields for configuration
        const formValues = form.getValues();
        let requiredFieldsValid = false;

        // Get errors from form state explicitly (like in the details step)
        const formErrors = form.formState.errors;
        const hasErrors = Object.keys(formErrors).length > 0;

        // Check asset-specific required fields
        switch (selectedAssetType) {
          case "bond":
            // Check if required fields are filled
            const hasCap = !!(formValues as any).cap;
            const hasFaceValue = !!(formValues as any).faceValue;
            const hasMaturityDate = !!(formValues as any).maturityDate;
            const hasUnderlyingAsset = !!(formValues as any).underlyingAsset;

            requiredFieldsValid =
              hasCap && hasFaceValue && hasMaturityDate && hasUnderlyingAsset;
            break;

          case "cryptocurrency":
            requiredFieldsValid = !!(formValues as any).maxSupply;
            break;

          case "equity":
            requiredFieldsValid = !!(formValues as any).sharesOutstanding;
            break;

          case "fund":
            requiredFieldsValid = !!(formValues as any).managementFeeBps;
            break;

          case "stablecoin":
            requiredFieldsValid = !!(formValues as any).collateralType;
            break;

          case "deposit":
            requiredFieldsValid = !!(formValues as any).depositType;
            break;

          default:
            requiredFieldsValid = true;
        }

        // Form is valid if required fields are filled and there are no errors
        const isValid = requiredFieldsValid && !hasErrors;
        setIsConfigurationValid(isValid);
      }

      if (currentStep === "permissions") {
        // Since permissions are optional in this step (they will be configurable later),
        // we'll just validate that the user has made any selections
        // and there are no form validation errors

        // Always consider permissions valid since the current user is added by default
        setIsPermissionsValid(true);
      }
    };

    // Check validity immediately and set up a subscription to form changes
    checkFormValidity();

    // Subscribe to form state changes
    const form = getFormForAssetType();
    const subscription = form.watch(() => {
      checkFormValidity();
    });

    return () => {
      if (subscription && typeof subscription === "object") {
        try {
          // @ts-expect-error - The subscription object has an unsubscribe method
          subscription.unsubscribe?.();
        } catch (error) {
          console.error("Error unsubscribing from form watch:", error);
        }
      }
    };
  }, [currentStep, selectedAssetType, getFormForAssetType]);

=======
>>>>>>> d02f46f1 (feat: new asset design UI iteration 2 (#1744))
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
    const form = getFormForAssetType();

    try {
      // Try to get a predicted address based on the asset type
      let predictedAddress = "0x0000000000000000000000000000000000000000";

      try {
        const formValues = form.getValues();

        switch (selectedAssetType) {
          case "bond": {
            // Only pass the required properties for bond prediction
            const bondFormValues = formValues as any;
            if (
              bondFormValues.cap &&
              bondFormValues.maturityDate &&
              bondFormValues.underlyingAsset &&
              bondFormValues.faceValue
            ) {
              predictedAddress = await getBondPredictedAddress({
                assetName: bondFormValues.assetName,
                symbol: bondFormValues.symbol,
                decimals: bondFormValues.decimals,
                cap: bondFormValues.cap,
                maturityDate: bondFormValues.maturityDate,
                underlyingAsset: bondFormValues.underlyingAsset,
                faceValue: bondFormValues.faceValue,
              });
            }
            break;
          }
          case "cryptocurrency": {
            // Only pass the required properties for cryptocurrency prediction
            const cryptoFormValues = formValues as any;
            if (cryptoFormValues.initialSupply) {
              predictedAddress = await getCryptocurrencyPredictedAddress({
                assetName: cryptoFormValues.assetName,
                symbol: cryptoFormValues.symbol,
                decimals: cryptoFormValues.decimals,
                initialSupply: cryptoFormValues.initialSupply,
              });
            }
            break;
          }
          case "stablecoin": {
            // Only pass the required properties for stablecoin prediction
            const stablecoinFormValues = formValues as any;
            if (
              stablecoinFormValues.collateralLivenessValue &&
              stablecoinFormValues.collateralLivenessTimeUnit
            ) {
              predictedAddress = await getStablecoinPredictedAddress({
                assetName: stablecoinFormValues.assetName,
                symbol: stablecoinFormValues.symbol,
                decimals: stablecoinFormValues.decimals,
                collateralLivenessValue:
                  stablecoinFormValues.collateralLivenessValue,
                collateralLivenessTimeUnit:
                  stablecoinFormValues.collateralLivenessTimeUnit,
              });
            }
            break;
          }
          default:
            // Generate a fallback random address for asset types without a prediction function
            predictedAddress = `0x${Math.random().toString(16).substring(2).padStart(40, "0")}`;
        }
      } catch (error) {
        console.error("Error predicting address:", error);
        // Generate a fallback random address in case of prediction failure
        predictedAddress = `0x${Math.random().toString(16).substring(2).padStart(40, "0")}`;
      }

      // Common values needed for asset creation
      const baseFormValues = {
        ...form.getValues(),
        verificationType: "pincode",
        predictedAddress,
      } as any;

      let formData;
      let action;

      // Prepare form data based on asset type
      switch (selectedAssetType) {
        case "bond":
          action = createBond;
          formData = {
            ...baseFormValues,
            maturityDate: baseFormValues.maturityDate || getTomorrowMidnight(),
          };
          break;
        case "cryptocurrency":
          action = createCryptoCurrency;
          formData = { ...baseFormValues };
          break;
        case "equity":
          action = createEquity;
          formData = { ...baseFormValues };
          break;
        case "fund":
          action = createFund;
          formData = { ...baseFormValues };
          break;
        case "stablecoin":
          action = createStablecoin;
          formData = { ...baseFormValues };
          break;
        case "deposit":
          action = createDeposit;
          formData = { ...baseFormValues };
          break;
        default:
          throw new Error("Invalid asset type");
      }

      // Store verification data and show pincode dialog
      setPincodeVerificationData({ action, formData });
      setShowVerificationDialog(true);
    } catch (error) {
      console.error("Error preparing asset creation:", error);
      toast.error("Failed to prepare asset creation. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle verification submission
  const handleVerificationSubmit = async () => {
    if (!pincodeVerificationData) return;

    try {
      // Get the verification code from the form
      const verificationCode = verificationForm.getValues().verificationCode;

      // Add the verification code to the form data
      const formDataWithCode = {
        ...pincodeVerificationData.formData,
        verificationCode,
      };

      // Show the loading toast only after pin confirmation
      const toastId = toast.loading(
        `Creating ${selectedAssetType}... This process may take a moment.`
      );

      // Submit the form with the action
      const result = await pincodeVerificationData.action(formDataWithCode);

      if (result.data) {
        try {
          // Parse the transaction hashes from the response
          const hashes = Array.isArray(result.data)
            ? result.data
            : [result.data];

          // Wait for the transactions to be confirmed using the dedicated function
          await waitForTransactions(hashes);

          // Add a small delay to allow indexing to complete
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Update the toast with success message
          toast.success(
            `${selectedAssetType?.charAt(0).toUpperCase() || ""}${selectedAssetType?.slice(1) || ""} was created successfully!`,
            { id: toastId }
          );

          // Close the dialog and reset state
          handleOpenChange(false);

          // Navigate to the asset page if we have a valid address
          const assetId = formDataWithCode.predictedAddress;
          if (
            assetId &&
            assetId !== "0x0000000000000000000000000000000000000000"
          ) {
            router.push(`/assets/${selectedAssetType}/${assetId}`);
          } else {
            // Refresh the current page
            router.refresh();
          }
        } catch (error) {
          console.error("Error waiting for transaction:", error);
          toast.error(
            "Transaction submitted but failed to confirm. Please check your activity history.",
            {
              id: toastId,
            }
          );
          handleOpenChange(false);
        }
      } else if (result.validationErrors) {
        // Update the toast with validation error message
        toast.error(
          "Please fix the validation errors before creating the asset.",
          { id: toastId }
        );
        console.error("Validation errors:", result.validationErrors);
      } else {
        // Update the toast with generic error message
        toast.error("Failed to create asset. Please try again.", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error creating asset:", error);
      // Show error toast
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowVerificationDialog(false);
      setPincodeVerificationData(null);
      verificationForm.reset();
    }
  };

  // Handle verification dialog close
  const handleVerificationCancel = () => {
    setIsSubmitting(false);
    setShowVerificationDialog(false);
    setPincodeVerificationData(null);
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
        className="max-h-screen h-[75vh] w-[75vw] p-0 overflow-hidden border-none right-0 !max-w-screen rounded-2xl"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <div className="relative h-full">
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
                onNext={() => setCurrentStep("regulation")}
              />
            )}

            {/* Regulation Step */}
            {currentStep === "regulation" && selectedAssetType && (
              <AssetRegulationStep
                assetType={selectedAssetType}
                form={getFormForAssetType()}
                onBack={() => setCurrentStep("permissions")}
                onNext={() => setCurrentStep("summary")}
              />
            )}

            {/* Summary Step */}
            {currentStep === "summary" && selectedAssetType && (
              <AssetSummaryStep
                assetType={selectedAssetType}
                form={getFormForAssetType()}
                isSubmitting={isSubmitting}
                onBack={() => setCurrentStep("regulation")}
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
