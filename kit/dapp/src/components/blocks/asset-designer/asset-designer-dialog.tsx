"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadToStorage } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
import { FormProvider, useForm } from "react-hook-form";

import { AssetTypeSelection } from "./steps/asset-type-selection";

// Import create actions for each asset type
import { createBond } from "@/lib/mutations/bond/create/create-action";
import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import { createEquity } from "@/lib/mutations/equity/create/create-action";
import { createFund } from "@/lib/mutations/fund/create/create-action";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";

// Import auth client for user session
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/client";

// Import the verification dialog
import { FormOtpDialog } from "@/components/blocks/form/inputs/form-otp-dialog";
import { getTomorrowMidnight } from "@/lib/utils/date";

// Import the predict address functions
import { getPredictedAddress as getBondPredictedAddress } from "@/lib/queries/bond-factory/bond-factory-predict-address";
import { getPredictedAddress as getCryptocurrencyPredictedAddress } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-predict-address";
import { getPredictedAddress as getStablecoinPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";

// Define a base form type that contains all possible fields
interface BaseFormValues {
  assetName: string;
  symbol: string;
  decimals?: number;
  isin?: string;
  cusip?: string;
  assetAdmins: string[];
  selectedRegulations: string[];
  // Add other possible fields here
}

export type AssetType =
  | "bond"
  | "cryptocurrency"
  | "equity"
  | "fund"
  | "stablecoin"
  | "deposit"
  | null;

export type AssetDesignerStep =
  | "type"
  | "details"
  | "configuration"
  | "permissions"
  | "regulation"
  | "summary";

// Define the order of steps
const stepsOrder: AssetDesignerStep[] = [
  "type",
  "details",
  "configuration",
  "permissions",
  "regulation",
  "summary",
];

// Define details for each step (title, description)
const stepDetailsMap: Record<
  AssetDesignerStep,
  { title: string; description: string }
> = {
  type: {
    title: "Asset Type",
    description: "Choose the type of digital asset to create.",
  },
  details: {
    title: "Basic information",
    description: "Provide general information about your asset.",
  },
  configuration: {
    title: "Asset configuration",
    description: "Configure specific parameters for your asset.",
  },
  permissions: {
    title: "Asset permissions",
    description: "Define who can manage and use this asset.",
  },
  regulation: {
    title: "Regulation",
    description: "Configure regulatory requirements for your asset.",
  },
  summary: {
    title: "Summary",
    description: "Review all the details before issuing your asset.",
  },
};

interface AssetDesignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDesignerDialog({
  open,
  onOpenChange,
}: AssetDesignerDialogProps) {
  const t = useTranslations("admin.sidebar");
  const [currentStep, setCurrentStep] = useState<AssetDesignerStep>("type");
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Form state tracking
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(false);
  const [isConfigurationValid, setIsConfigurationValid] = useState(false);
  const [isPermissionsValid, setIsPermissionsValid] = useState(false);
  const [isRegulationValid, setIsRegulationValid] = useState(true); // Default to true since it's optional
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

  // State for verification dialog
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [pincodeVerificationData, setPincodeVerificationData] = useState<{
    action: any;
    formData: any;
  } | null>(null);

  // Create a form for the verification code
  const verificationForm = useForm({
    defaultValues: {
      verificationCode: "",
      verificationType: "pincode",
    },
  });

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
  const getFormForAssetType = () => {
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
  };

  // Check if all required fields are filled and valid for the current step
  useEffect(() => {
    if (!selectedAssetType) return;

    const checkFormValidity = async () => {
      const form = getFormForAssetType();

      // Get form state
      const { errors, touchedFields, dirtyFields } = form.formState;

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

        // For the permissions step, we'll validate that at least the current user is assigned as admin
        const formValues = form.getValues();
        const assetAdmins = formValues.assetAdmins || [];

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
  }, [currentStep, selectedAssetType]);

  const handleAssetTypeSelect = (type: AssetType) => {
    setSelectedAssetType(type);
    // Reset validation states when changing asset type
    setIsBasicInfoValid(false);
    setIsConfigurationValid(false);
    // Move to the next step after selecting an asset type
    if (type) {
      setCurrentStep("details");
    }
  };

  const resetDesigner = () => {
    setCurrentStep("type");
    setSelectedAssetType(null);
    setIsBasicInfoValid(false);
    setIsConfigurationValid(false);

    // Reset all forms
    bondForm.reset();
    cryptocurrencyForm.reset();
    equityForm.reset();
    fundForm.reset();
    stablecoinForm.reset();
    depositForm.reset();
  };

  // When the dialog is closed, reset the state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDesigner();
    }
    onOpenChange(newOpen);
  };

  // Get the title for the asset type
  const getAssetTitle = () => {
    if (!selectedAssetType) return "Design a new asset";

    switch (selectedAssetType) {
      case "bond":
        return "Design a new bond";
      case "cryptocurrency":
        return "Design a new cryptocurrency";
      case "equity":
        return "Design a new equity";
      case "fund":
        return "Design a new fund";
      case "stablecoin":
        return "Design a new stablecoin";
      case "deposit":
        return "Design a new deposit";
      default:
        return "Design a new asset";
    }
  };

  // Get the description for the asset type
  const getAssetDescription = () => {
    if (!selectedAssetType) return "Create your digital asset in a few steps";

    switch (selectedAssetType) {
      case "bond":
        return "Debt instruments issued as tokenized securities.";
      case "cryptocurrency":
        return "Decentralized digital assets used as a medium of exchange or store of value.";
      case "equity":
        return "Assets representing ownership in a company.";
      case "fund":
        return "Investment vehicles pooled by professional managers.";
      case "stablecoin":
        return "Digital assets pegged to a stable asset like USD.";
      case "deposit":
        return "Digital assets that represent a deposit of a traditional asset.";
      default:
        return "Create your digital asset in a few steps";
    }
  };

  // Render the appropriate basics component for the selected asset type
  const renderBasicsComponent = () => {
    switch (selectedAssetType) {
      case "bond":
        return (
          <FormProvider {...(bondForm as any)}>
            <BondBasics />
          </FormProvider>
        );
      case "cryptocurrency":
        return (
          <FormProvider {...(cryptocurrencyForm as any)}>
            <CryptocurrencyBasics />
          </FormProvider>
        );
      case "equity":
        return (
          <FormProvider {...(equityForm as any)}>
            <EquityBasics />
          </FormProvider>
        );
      case "fund":
        return (
          <FormProvider {...(fundForm as any)}>
            <FundBasics />
          </FormProvider>
        );
      case "stablecoin":
        return (
          <FormProvider {...(stablecoinForm as any)}>
            <StablecoinBasics />
          </FormProvider>
        );
      case "deposit":
        return (
          <FormProvider {...(depositForm as any)}>
            <DepositBasics />
          </FormProvider>
        );
      default:
        return null;
    }
  };

  // Render the appropriate configuration component for the selected asset type
  const renderConfigurationComponent = () => {
    switch (selectedAssetType) {
      case "bond":
        return (
          <FormProvider {...(bondForm as any)}>
            <BondConfiguration />
          </FormProvider>
        );
      case "cryptocurrency":
        return (
          <FormProvider {...(cryptocurrencyForm as any)}>
            <CryptocurrencyConfiguration />
          </FormProvider>
        );
      case "equity":
        return (
          <FormProvider {...(equityForm as any)}>
            <EquityConfiguration />
          </FormProvider>
        );
      case "fund":
        return (
          <FormProvider {...(fundForm as any)}>
            <FundConfiguration />
          </FormProvider>
        );
      case "stablecoin":
        return (
          <FormProvider {...(stablecoinForm as any)}>
            <StablecoinConfiguration />
          </FormProvider>
        );
      case "deposit":
        return (
          <FormProvider {...(depositForm as any)}>
            <DepositConfiguration />
          </FormProvider>
        );
      default:
        return null;
    }
  };

  // Render the permissions component for the asset
  const renderPermissionsComponent = () => {
    const form = getFormForAssetType();

    // Use a type assertion to ensure FormProvider accepts our form
    return (
      <FormProvider {...(form as any)}>
        <AssetAdmins />
      </FormProvider>
    );
  };

  // Define the regulations available for each region
  const regionRegulations = {
    EU: [
      {
        id: "mica",
        name: "MiCA (Markets in Crypto-assets)",
        description: "EU regulatory framework for crypto-assets",
      },
    ],
    US: [
      {
        id: "sec",
        name: "SEC Compliance",
        description: "Securities and Exchange Commission requirements",
      },
    ],
    UK: [
      {
        id: "fca",
        name: "FCA Guidance",
        description: "Financial Conduct Authority regulatory framework",
      },
    ],
    SG: [
      {
        id: "mas-psa",
        name: "MAS PSA",
        description: "Monetary Authority of Singapore Payment Services Act",
      },
      {
        id: "fsra-sg",
        name: "FSRA",
        description: "Financial Services Regulatory Authority",
      },
    ],
    JP: [
      {
        id: "fsra-jp",
        name: "FSRA",
        description: "Financial Services Regulatory Authority",
      },
    ],
    CH: [
      {
        id: "finma",
        name: "FINMA Regulation",
        description: "Swiss Financial Market Supervisory Authority",
      },
    ],
  };

  // Render the regulation component for the asset
  const renderRegulationComponent = () => {
    const form = getFormForAssetType();

    // Get all available regulations based on selected regions
    const availableRegulations =
      selectedRegions.length === 0
        ? Object.values(regionRegulations).flat()
        : selectedRegions.flatMap(
            (region) =>
              regionRegulations[region as keyof typeof regionRegulations] || []
          );

    // Handle region selection toggle
    const toggleRegion = (region: string) => {
      setSelectedRegions((prev) =>
        prev.includes(region)
          ? prev.filter((r) => r !== region)
          : [...prev, region]
      );
    };

    // Handle regulation checkbox toggle
    const toggleRegulation = (regulationId: string, checked: boolean) => {
      const currentForm = getFormForAssetType();
      const currentRegulations =
        currentForm.getValues().selectedRegulations || [];

      if (checked) {
        // Add the regulation if it's not already selected
        if (!currentRegulations.includes(regulationId)) {
          // Type assertion to ensure TypeScript understands the setValue method is valid
          (currentForm.setValue as any)(
            "selectedRegulations",
            [...currentRegulations, regulationId],
            {
              shouldValidate: true,
              shouldDirty: true,
            }
          );
        }
      } else {
        // Remove the regulation
        (currentForm.setValue as any)(
          "selectedRegulations",
          currentRegulations.filter((id) => id !== regulationId),
          {
            shouldValidate: true,
            shouldDirty: true,
          }
        );
      }
    };

    // Document upload handlers
    const openDocumentDialog = (regulationId: string) => {
      setDialogOpen(regulationId);
      setSelectedFile(null);
      setDocumentTitle("");
      setDocumentType("");
      setDocumentDescription("");
    };

    const closeDocumentDialog = () => {
      setDialogOpen(null);
      setSelectedFile(null);
      setDocumentTitle("");
      setDocumentType("");
      setDocumentDescription("");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
          toast.error("File is too large. Maximum file size is 10MB.");
          return;
        }

        // Validate file type
        if (file.type !== "application/pdf") {
          toast.error("Only PDF files are accepted.");
          return;
        }

        setSelectedFile(file);
      }
    };

    const handleUploadDocument = async () => {
      if (dialogOpen && selectedFile) {
        if (!documentTitle) {
          toast.error("Document title is required");
          return;
        }

        setIsUploading(true);
        try {
          // Create form data for upload
          const formData = new FormData();
          formData.append("file", selectedFile);

          // Use the server action to upload the file with the regulation ID as path
          // This helps organize uploads by regulation
          const path = `regulations/${dialogOpen}`;
          const result = await uploadToStorage(formData, path);

          // Add the uploaded document to state
          const newDocument = {
            id: result.id,
            name: selectedFile.name,
            title: documentTitle || selectedFile.name,
            type: documentType,
            description: documentDescription,
            url: result.url,
          };

          setUploadedDocuments((prev) => ({
            ...prev,
            [dialogOpen]: [...(prev[dialogOpen] || []), newDocument],
          }));

          // Show success message
          toast.success("Document uploaded successfully");

          // Close dialog
          closeDocumentDialog();
        } catch (error) {
          console.error("Error uploading document:", error);
          toast.error("Failed to upload document. Please try again.");
        } finally {
          setIsUploading(false);
        }
      }
    };

    // Get currently selected regulations from form
    const selectedRegulations = form.getValues().selectedRegulations || [];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Regulation</h3>
          <p className="text-sm text-muted-foreground">
            Select regions and configure the regulations your asset needs to
            adhere to.
          </p>
        </div>

        {/* Region selection */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Select Regions</h4>
          <p className="text-xs text-muted-foreground">
            Choose the regions where your asset will operate to see applicable
            regulations.
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.keys(regionRegulations).map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => toggleRegion(region)}
                className={`flex flex-col items-center justify-center p-3 rounded-md border ${
                  selectedRegions.includes(region)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium">{region}</span>
                <span className="text-xs text-muted-foreground">
                  {region === "EU" && "European Union"}
                  {region === "US" && "United States"}
                  {region === "UK" && "United Kingdom"}
                  {region === "SG" && "Singapore"}
                  {region === "JP" && "Japan"}
                  {region === "CH" && "Switzerland"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Available regulations */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Available Regulations</h4>
          <p className="text-xs text-muted-foreground">
            Select regulations based on your operating regions. If multiple are
            selected, all regulations from all selected regions will be
            displayed.
          </p>
          <div className="space-y-3">
            {availableRegulations.map((regulation) => (
              <div
                key={regulation.id}
                className="border rounded-md p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center pt-1 h-5">
                    <input
                      type="checkbox"
                      id={regulation.id}
                      checked={selectedRegulations.includes(regulation.id)}
                      onChange={(e) =>
                        toggleRegulation(regulation.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={regulation.id}
                      className="font-medium cursor-pointer"
                    >
                      {regulation.name}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {regulation.description}
                    </p>
                  </div>
                </div>

                {/* Key Requirements section - only show if regulation is checked */}
                {selectedRegulations.includes(regulation.id) && (
                  <div className="pl-8 space-y-4">
                    <h5 className="text-sm font-medium">Key Requirements</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="h-5 w-5 rounded-full border flex items-center justify-center text-xs text-gray-500">
                            ✓
                          </div>
                          <span className="text-sm">
                            Asset disclosure requirements
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-5 w-5 rounded-full border flex items-center justify-center text-xs text-gray-500">
                            ✓
                          </div>
                          <span className="text-sm">Reserve requirements</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-5 w-5 rounded-full border flex items-center justify-center text-xs text-gray-500">
                            ✓
                          </div>
                          <span className="text-sm">Anti-fraud provisions</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="h-5 w-5 rounded-full border flex items-center justify-center text-xs text-gray-500">
                            ✓
                          </div>
                          <span className="text-sm">
                            AML & market protection
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-5 w-5 rounded-full border flex items-center justify-center text-xs text-gray-500">
                            ✓
                          </div>
                          <span className="text-sm">
                            Transparency requirements
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-5 w-5 rounded-full border flex items-center justify-center text-xs text-gray-500">
                            ✓
                          </div>
                          <span className="text-sm">Consumer protection</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      * Required by regulation
                    </p>

                    {/* Documentation section for this specific regulation */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="text-sm font-medium">Documentation</h5>
                          <p className="text-xs text-muted-foreground">
                            Upload and manage compliance documentation for{" "}
                            {regulation.name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="text-xs font-medium">Documents</h6>
                          <button
                            type="button"
                            onClick={() => openDocumentDialog(regulation.id)}
                            className="inline-flex items-center text-xs text-primary hover:text-primary/80"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="size-3 mr-1"
                            >
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                            Add Document
                          </button>
                        </div>

                        {uploadedDocuments[regulation.id]?.length > 0 ? (
                          <div className="space-y-2">
                            {uploadedDocuments[regulation.id].map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between border rounded-md p-2"
                              >
                                <div className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-4 mr-2 text-muted-foreground"
                                  >
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                  </svg>
                                  <div>
                                    <span className="text-sm font-medium">
                                      {doc.title}
                                    </span>
                                    {doc.type && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {doc.type}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setUploadedDocuments((prev) => ({
                                      ...prev,
                                      [regulation.id]: prev[
                                        regulation.id
                                      ].filter((d) => d.id !== doc.id),
                                    }));
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-4"
                                  >
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border rounded-md p-4 bg-muted/30 flex flex-col items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="size-6 mb-2 text-muted-foreground"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <p className="text-sm text-center text-muted-foreground mb-2">
                              No documents uploaded yet
                            </p>
                            <button
                              type="button"
                              onClick={() => openDocumentDialog(regulation.id)}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 text-xs"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-3 mr-1"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                              </svg>
                              Upload Document
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upload Document Dialog */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Upload Document</h3>
                <button
                  type="button"
                  onClick={closeDocumentDialog}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Upload white papers, audit reports, and other compliance
                documents
              </p>

              <div className="space-y-4">
                {/* Document Title */}
                <div className="grid w-full items-center gap-1.5">
                  <label
                    htmlFor="document-title"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Document Title
                  </label>
                  <input
                    id="document-title"
                    type="text"
                    placeholder="e.g. MiCA Compliance White Paper"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>

                {/* Document Type */}
                <div className="grid w-full items-center gap-1.5">
                  <label
                    htmlFor="document-type"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Document Type
                  </label>
                  <select
                    id="document-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="" disabled>
                      Select document type
                    </option>
                    <option value="Compliance">Compliance</option>
                    <option value="Legal">Legal</option>
                    <option value="Financial">Financial</option>
                    <option value="Audit">Audit</option>
                    <option value="Whitepaper">Whitepaper</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div className="grid w-full items-center gap-1.5">
                  <label
                    htmlFor="document-description"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Description
                  </label>
                  <textarea
                    id="document-description"
                    placeholder="Brief description of the document"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                  />
                </div>

                {/* File Upload */}
                <div className="grid w-full items-center gap-1.5">
                  <label
                    htmlFor="document-upload"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Upload File
                  </label>
                  <div className="flex items-center">
                    <label
                      htmlFor="document-upload"
                      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                    >
                      Choose File
                    </label>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                    <input
                      id="document-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="application/pdf"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accepted format: PDF only (Max: 10MB)
                  </p>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={closeDocumentDialog}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadDocument}
                    disabled={!selectedFile || !documentTitle || isUploading}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle asset creation submission
  const handleCreateAsset = async () => {
    if (!selectedAssetType) return;

    // Remove the immediate toast notification
    // const toastId = toast.loading(
    //   `Creating ${selectedAssetType}... This process may take a moment.`
    // );

    setIsSubmitting(true);
    const form = getFormForAssetType();

    try {
      // Get a unique predicted address for the asset instead of using a static one
      let predictedAddress = "0x0000000000000000000000000000000000000000";

      // Try to get a predicted address based on the asset type
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
          // Other asset types would need their own implementation
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
      } as any; // Use type assertion to bypass TypeScript checks

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
          formData = {
            ...baseFormValues,
          };
          break;
        case "equity":
          action = createEquity;
          formData = {
            ...baseFormValues,
          };
          break;
        case "fund":
          action = createFund;
          formData = {
            ...baseFormValues,
          };
          break;
        case "stablecoin":
          action = createStablecoin;
          formData = {
            ...baseFormValues,
          };
          break;
        case "deposit":
          action = createDeposit;
          formData = {
            ...baseFormValues,
          };
          break;
        default:
          throw new Error("Invalid asset type");
      }

      // Store verification data and show pincode dialog
      // Remove the toastId from pincodeVerificationData
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
      // Show error toast without relying on a previous toastId
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
    // Remove toast dismissal since we're not creating a toast in handleCreateAsset anymore
    // if (pincodeVerificationData?.toastId) {
    //   toast.dismiss(pincodeVerificationData.toastId);
    // }
    setIsSubmitting(false);
    setShowVerificationDialog(false);
    setPincodeVerificationData(null);
    verificationForm.reset();
  };

  const currentStepIndex = stepsOrder.indexOf(currentStep);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-screen h-[90vh] w-[90vw] p-0 overflow-hidden rounded-none border-none right-0 !max-w-screen rounded-2xl">
        <div className="flex h-full flex-col">
          {/* Header - Removed from here */}

          {/* Main content area with sidebar */}
          <div className="flex flex-1 overflow-hidden p-6">
            {/* Sidebar / Steps */}
            <div className="w-64 bg-sidebar border-r p-6 flex flex-col rounded-xl">
              {/* Moved Title and Description Here */}
              <div className="mb-6">
                <DialogTitle className="text-xl">{getAssetTitle()}</DialogTitle>
                <DialogDescription>{getAssetDescription()}</DialogDescription>
              </div>
              {/* Existing Sidebar Content - Refactored */}
              <div className="space-y-0 flex-1 overflow-y-auto relative">
                {stepsOrder.map((step, index) => {
                  const isCurrent = currentStep === step;
                  const isCompleted =
                    index < currentStepIndex && selectedAssetType !== null;
                  // Step is disabled if it's beyond the current step, OR if no asset type is selected and it's not the first step.
                  const isDisabled =
                    index > currentStepIndex ||
                    (!selectedAssetType && index > 0);
                  // Special case: Step 1 ('type') is never disabled based on currentStepIndex
                  const finalDisabled = step === "type" ? false : isDisabled;

                  const stepDetails = stepDetailsMap[step];

                  return (
                    <div key={step} className="relative py-2">
                      {/* Vertical line - Conditionally render with lower z-index */}
                      {index < stepsOrder.length - 1 && (
                        <div className="absolute left-[1.5rem] top-[1.4rem] h-[calc(100%+0.5rem)] w-0 border-l-2 border-dashed border-slate-300 z-10"></div>
                      )}

                      <button
                        type="button"
                        className={cn(
                          "flex flex-col w-full px-3 py-2 rounded-md transition-colors text-left relative z-20", // Ensure button itself has z-20
                          isCurrent
                            ? "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          finalDisabled && "cursor-not-allowed",
                          !isCurrent && "text-muted-foreground"
                        )}
                        onClick={() => !finalDisabled && setCurrentStep(step)}
                        disabled={finalDisabled}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={cn(
                              "flex shrink-0 items-center justify-center rounded-full text-xs font-medium z-30 relative", // Icon container z-index > line
                              // Conditional Size:
                              isCompleted ? "h-6 w-6" : "h-7 w-7",
                              // Add bg-sidebar for current/inactive states to cover the line
                              isCompleted
                                ? "bg-primary text-primary-foreground border-primary"
                                : isCurrent
                                  ? "border-none text-primary bg-sidebar"
                                  : "border-none text-muted-foreground bg-sidebar"
                            )}
                          >
                            {/* Conditional Icon Rendering with adjusted sizes */}
                            {isCompleted ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            ) : isCurrent ? (
                              <svg
                                width="18" // Increased size
                                height="18" // Increased size
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-current"
                              >
                                <circle
                                  cx="8"
                                  cy="8"
                                  r="7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx="8"
                                  cy="8"
                                  r="3"
                                  fill="currentColor"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="18" // Increased size
                                height="18" // Increased size
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-current"
                              >
                                <circle
                                  cx="8"
                                  cy="8"
                                  r="7"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-sm",
                              isCurrent ? "font-bold" : "font-medium" // Active title bold
                            )}
                          >
                            {stepDetails.title}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-xs mt-1 ml-9",
                            isCurrent
                              ? "text-sidebar-foreground/70" // Active description opacity
                              : "text-sidebar-foreground/25" // Inactive description opacity
                          )}
                        >
                          {stepDetails.description}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto bg-background ml-6 rounded-lg">
              {/* Removed DialogHeader from here */}
              {currentStep === "type" && (
                <AssetTypeSelection
                  selectedType={selectedAssetType}
                  onSelect={handleAssetTypeSelect}
                />
              )}
              {currentStep === "details" && (
                <div className="p-6">
                  {renderBasicsComponent()}

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("type")}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (isBasicInfoValid) {
                          setCurrentStep("configuration");
                        }
                      }}
                      disabled={!isBasicInfoValid}
                      className={
                        !isBasicInfoValid ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === "configuration" && (
                <div className="p-6">
                  {renderConfigurationComponent()}

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("details")}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (isConfigurationValid) {
                          setCurrentStep("permissions");
                        }
                      }}
                      disabled={!isConfigurationValid}
                      className={
                        !isConfigurationValid
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === "permissions" && (
                <div className="p-6">
                  {renderPermissionsComponent()}

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("configuration")}
                    >
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep("regulation")}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === "regulation" && (
                <div className="p-6">
                  {renderRegulationComponent()}

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("permissions")}
                    >
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep("summary")}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === "summary" && (
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        This is the final step before creating your asset.
                        Please review all the details you have entered.
                      </p>
                    </div>

                    {/* Asset Type section */}
                    <div className="rounded-md border p-4 space-y-4">
                      <div className="flex items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          1
                        </div>
                        <h4 className="text-base font-medium ml-2">
                          Asset Type
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        The type of digital asset you are creating.
                      </p>
                      <div className="ml-8">
                        <div className="bg-muted p-4 rounded-md inline-flex items-center gap-3">
                          {selectedAssetType === "bond" && (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                              >
                                <rect
                                  width="18"
                                  height="12"
                                  x="3"
                                  y="6"
                                  rx="2"
                                />
                                <path d="M14 12.25A3.28 3.28 0 0 1 13.24 15c-1.3 1.52-3.56 2-5.5 2a7.5 7.5 0 0 1-5.1-2" />
                                <path d="M10 9.5a3.28 3.28 0 0 1 5.5 2c0 1.5-1.37 2-3 2" />
                                <path d="M15 9.5V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.5" />
                              </svg>
                              <div>
                                <p className="font-medium">Bond</p>
                                <p className="text-sm text-muted-foreground">
                                  Debt instruments issued as tokenized
                                  securities.
                                </p>
                              </div>
                            </>
                          )}
                          {selectedAssetType === "cryptocurrency" && (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M15 9.354a4 4 0 1 0 0 5.292" />
                                <path d="M9 12h6" />
                              </svg>
                              <div>
                                <p className="font-medium">Cryptocurrency</p>
                                <p className="text-sm text-muted-foreground">
                                  Decentralized digital assets used as a medium
                                  of exchange or store of value.
                                </p>
                              </div>
                            </>
                          )}
                          {selectedAssetType === "equity" && (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                              >
                                <rect
                                  width="18"
                                  height="18"
                                  x="3"
                                  y="3"
                                  rx="2"
                                />
                                <path d="M15 8h.01" />
                                <path d="m7 13 3-3 2 2 5-5" />
                              </svg>
                              <div>
                                <p className="font-medium">Equity</p>
                                <p className="text-sm text-muted-foreground">
                                  Assets representing ownership in a company.
                                </p>
                              </div>
                            </>
                          )}
                          {selectedAssetType === "fund" && (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                              >
                                <path d="M12 2v20" />
                                <path d="M2 12h20" />
                                <path d="m4.93 4.93 14.14 14.14" />
                                <path d="m19.07 4.93-14.14 14.14" />
                              </svg>
                              <div>
                                <p className="font-medium">Fund</p>
                                <p className="text-sm text-muted-foreground">
                                  Investment vehicles pooled by professional
                                  managers.
                                </p>
                              </div>
                            </>
                          )}
                          {selectedAssetType === "stablecoin" && (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1="9" x2="9.01" y1="9" y2="9" />
                                <line x1="15" x2="15.01" y1="9" y2="9" />
                              </svg>
                              <div>
                                <p className="font-medium">Stablecoin</p>
                                <p className="text-sm text-muted-foreground">
                                  Digital assets pegged to a stable asset like
                                  USD.
                                </p>
                              </div>
                            </>
                          )}
                          {selectedAssetType === "deposit" && (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-primary"
                              >
                                <path d="M2 9V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v4" />
                                <path d="M2 13v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6" />
                                <path d="M4 9h16v4H4z" />
                              </svg>
                              <div>
                                <p className="font-medium">Deposit</p>
                                <p className="text-sm text-muted-foreground">
                                  Digital assets that represent a deposit of a
                                  traditional asset.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Basic information section */}
                    <div className="rounded-md border p-4 space-y-4">
                      <div className="flex items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          2
                        </div>
                        <h4 className="text-base font-medium ml-2">
                          Basic information
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        General information about your asset.
                      </p>
                      <div className="ml-8 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Name</p>
                          <p className="text-sm">
                            {(getFormForAssetType().getValues() as any)
                              .assetName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Symbol</p>
                          <p className="text-sm">
                            {(getFormForAssetType().getValues() as any)
                              .symbol || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Decimals</p>
                          <p className="text-sm">
                            {(
                              getFormForAssetType().getValues() as any
                            ).decimals?.toString() || "Not provided"}
                          </p>
                        </div>
                        {selectedAssetType === "bond" ||
                        selectedAssetType === "equity" ||
                        selectedAssetType === "fund" ? (
                          <div>
                            <p className="text-sm font-medium">ISIN</p>
                            <p className="text-sm">
                              {(getFormForAssetType().getValues() as any)
                                .isin || "Not provided"}
                            </p>
                          </div>
                        ) : null}
                        {selectedAssetType === "equity" ? (
                          <div>
                            <p className="text-sm font-medium">CUSIP</p>
                            <p className="text-sm">
                              {(getFormForAssetType().getValues() as any)
                                .cusip || "Not provided"}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Configuration section */}
                    <div className="rounded-md border p-4 space-y-4">
                      <div className="flex items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          3
                        </div>
                        <h4 className="text-base font-medium ml-2">
                          Configuration
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        Specific parameters for your asset.
                      </p>
                      <div className="ml-8 grid grid-cols-2 gap-4">
                        {selectedAssetType === "bond" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">
                                Collateral proof validity
                              </p>
                              <p className="text-sm">12 months</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Price</p>
                              <p className="text-sm">€1</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Cap</p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .cap || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Face Value</p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .faceValue || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Maturity Date
                              </p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .maturityDate || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Underlying Asset
                              </p>
                              <p className="text-sm">
                                {(() => {
                                  const asset = (
                                    getFormForAssetType().getValues() as any
                                  ).underlyingAsset;
                                  if (!asset) return "Not provided";
                                  if (typeof asset === "object") {
                                    // Extract a displayable property from the object
                                    return (
                                      asset.name ||
                                      asset.symbol ||
                                      asset.id ||
                                      JSON.stringify(asset)
                                    );
                                  }
                                  return asset;
                                })() || "Not provided"}
                              </p>
                            </div>
                          </>
                        )}
                        {selectedAssetType === "cryptocurrency" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">Max Supply</p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .maxSupply || "Not provided"}
                              </p>
                            </div>
                          </>
                        )}
                        {selectedAssetType === "equity" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">
                                Shares Outstanding
                              </p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .sharesOutstanding || "Not provided"}
                              </p>
                            </div>
                          </>
                        )}
                        {selectedAssetType === "fund" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">
                                Management Fee BPS
                              </p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .managementFeeBps || "Not provided"}
                              </p>
                            </div>
                          </>
                        )}
                        {selectedAssetType === "stablecoin" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">
                                Collateral Type
                              </p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .collateralType || "Not provided"}
                              </p>
                            </div>
                          </>
                        )}
                        {selectedAssetType === "deposit" && (
                          <>
                            <div>
                              <p className="text-sm font-medium">
                                Deposit Type
                              </p>
                              <p className="text-sm">
                                {(getFormForAssetType().getValues() as any)
                                  .depositType || "Not provided"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Asset permissions section */}
                    <div className="rounded-md border p-4 space-y-4">
                      <div className="flex items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          4
                        </div>
                        <h4 className="text-base font-medium ml-2">
                          Asset permissions
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        Administrative roles and permissions for managing this
                        asset.
                      </p>
                      <div className="ml-8 space-y-2">
                        <div>
                          <p className="text-sm font-medium">
                            Asset Administrators
                          </p>
                        </div>

                        <div className="space-y-2">
                          {/* Always show Patrick Mualaba with all roles */}
                          <div className="relative flex items-center justify-between rounded-md border p-3 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Patrick Mualaba</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                Admin
                              </div>
                              <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                User manager
                              </div>
                              <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                Supply manager
                              </div>
                            </div>
                          </div>

                          {/* Show any additional admins from the form */}
                          {(getFormForAssetType().getValues() as any)
                            .assetAdmins?.length > 0 &&
                            (
                              getFormForAssetType().getValues() as any
                            ).assetAdmins.map((admin: any, index: number) => {
                              // Handle both the old string format and the new object format
                              const adminAddress = admin.wallet || admin;
                              // Skip if this is the same as Patrick Mualaba (to avoid duplicate entries)
                              if (adminAddress === "Patrick Mualaba")
                                return null;

                              const roles = admin.roles || [
                                "admin",
                                "user-manager",
                                "supply-manager",
                              ];

                              return (
                                <div
                                  key={index}
                                  className="relative flex items-center justify-between rounded-md border p-3 shadow-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {adminAddress}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {roles.includes("admin") && (
                                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                        Admin
                                      </div>
                                    )}
                                    {roles.includes("user-manager") && (
                                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                        User manager
                                      </div>
                                    )}
                                    {(roles.includes("issuer") ||
                                      roles.includes("supply-manager")) && (
                                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                        Supply manager
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Regulation section */}
                    <div className="rounded-md border p-4 space-y-4">
                      <div className="flex items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          5
                        </div>
                        <h4 className="text-base font-medium ml-2">
                          Regulation
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        Regulatory compliance information for your asset.
                      </p>
                      {getFormForAssetType().getValues().selectedRegulations
                        ?.length ? (
                        <div className="ml-8 space-y-3">
                          {getFormForAssetType()
                            .getValues()
                            .selectedRegulations.map((regulationId, index) => {
                              const region = Object.entries(
                                regionRegulations
                              ).find(([_, regulations]) =>
                                regulations.some(
                                  (reg) => reg.id === regulationId
                                )
                              )?.[0];

                              const regulation = Object.values(
                                regionRegulations
                              )
                                .flat()
                                .find((reg) => reg.id === regulationId);

                              return (
                                <div
                                  key={index}
                                  className="bg-muted p-3 rounded-md"
                                >
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm font-medium">
                                        {regulation?.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {regulation?.description}
                                      </p>
                                    </div>
                                    <div className="bg-background text-xs font-medium px-2 py-1 rounded-md h-fit">
                                      {region}
                                    </div>
                                  </div>
                                  {uploadedDocuments[regulationId]?.length >
                                    0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-xs font-medium">
                                        Uploaded Documents:
                                      </p>
                                      {uploadedDocuments[regulationId].map(
                                        (doc, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center text-xs"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="12"
                                              height="12"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="mr-1"
                                            >
                                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                              <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                            {doc.title}
                                            {doc.type && (
                                              <span className="text-muted-foreground ml-1">
                                                ({doc.type})
                                              </span>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground ml-8">
                          No regulatory compliance selected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("regulation")}
                    >
                      Back
                    </Button>
                    <Button onClick={handleCreateAsset} disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create asset"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Verification dialog */}
      <FormProvider {...verificationForm}>
        <FormOtpDialog
          name="verificationCode"
          open={showVerificationDialog}
          onOpenChange={(open) => {
            if (!open) handleVerificationCancel();
            else setShowVerificationDialog(open);
          }}
          onSubmit={handleVerificationSubmit}
        />
      </FormProvider>
    </Dialog>
  );
}
