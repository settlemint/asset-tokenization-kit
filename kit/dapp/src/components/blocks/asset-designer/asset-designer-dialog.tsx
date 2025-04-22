"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadToStorage } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

        // Debug log to help identify issues
        console.log("Step 3 validation:", {
          requiredFieldsValid,
          hasErrors,
          formErrors,
          formValues,
        });

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
        setSelectedFile(e.target.files[0]);
      }
    };

    const handleUploadDocument = async () => {
      if (dialogOpen && selectedFile) {
        setIsUploading(true);
        try {
          // Create form data for upload
          const formData = new FormData();
          formData.append("file", selectedFile);

          // Use the server action to upload the file
          const result = await uploadToStorage(formData);

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

          // Close dialog
          closeDocumentDialog();
        } catch (error) {
          console.error("Error uploading document:", error);
          // You might want to show an error notification here
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-screen h-screen w-screen p-0 overflow-hidden rounded-none border-none right-0 !max-w-screen">
        <div className="flex h-full flex-col">
          {/* Header */}
          <DialogHeader className="py-4 px-6 border-b flex-row justify-between items-center bg-background">
            <div>
              <DialogTitle className="text-xl">{getAssetTitle()}</DialogTitle>
              <DialogDescription>{getAssetDescription()}</DialogDescription>
            </div>
          </DialogHeader>

          {/* Main content area with sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar / Steps */}
            <div className="w-64 bg-sidebar border-r p-6">
              <div className="space-y-1">
                <StepItem
                  number={1}
                  title="Asset Type"
                  description="Choose the type of digital asset to create."
                  isActive={currentStep === "type"}
                  isCompleted={
                    currentStep !== "type" && selectedAssetType !== null
                  }
                  onClick={() => setCurrentStep("type")}
                />
                <StepItem
                  number={2}
                  title="Basic information"
                  description="Provide general information about your asset."
                  isActive={currentStep === "details"}
                  isCompleted={
                    currentStep !== "type" &&
                    currentStep !== "details" &&
                    selectedAssetType !== null
                  }
                  onClick={() => selectedAssetType && setCurrentStep("details")}
                  disabled={!selectedAssetType}
                />
                <StepItem
                  number={3}
                  title="Asset configuration"
                  description="Configure specific parameters for your asset."
                  isActive={currentStep === "configuration"}
                  isCompleted={
                    currentStep !== "type" &&
                    currentStep !== "details" &&
                    currentStep !== "configuration" &&
                    selectedAssetType !== null
                  }
                  onClick={() =>
                    selectedAssetType && setCurrentStep("configuration")
                  }
                  disabled={!selectedAssetType || currentStep === "type"}
                />
                <StepItem
                  number={4}
                  title="Asset permissions"
                  description="Define who can manage and use this asset."
                  isActive={currentStep === "permissions"}
                  isCompleted={
                    currentStep !== "type" &&
                    currentStep !== "details" &&
                    currentStep !== "configuration" &&
                    currentStep !== "permissions" &&
                    selectedAssetType !== null
                  }
                  onClick={() =>
                    selectedAssetType && setCurrentStep("permissions")
                  }
                  disabled={
                    !selectedAssetType ||
                    currentStep === "type" ||
                    currentStep === "details"
                  }
                />
                <StepItem
                  number={5}
                  title="Regulation"
                  description="Configure regulatory requirements for your asset."
                  isActive={currentStep === "regulation"}
                  isCompleted={
                    currentStep !== "type" &&
                    currentStep !== "details" &&
                    currentStep !== "configuration" &&
                    currentStep !== "permissions" &&
                    currentStep !== "regulation" &&
                    selectedAssetType !== null
                  }
                  onClick={() =>
                    selectedAssetType && setCurrentStep("regulation")
                  }
                  disabled={
                    !selectedAssetType ||
                    currentStep === "type" ||
                    currentStep === "details" ||
                    currentStep === "configuration"
                  }
                />
                <StepItem
                  number={6}
                  title="Summary"
                  description="Review all the details before issuing your asset."
                  isActive={currentStep === "summary"}
                  isCompleted={false}
                  onClick={() => selectedAssetType && setCurrentStep("summary")}
                  disabled={
                    !selectedAssetType ||
                    currentStep === "type" ||
                    currentStep === "details" ||
                    currentStep === "configuration" ||
                    currentStep === "permissions" ||
                    currentStep === "regulation"
                  }
                />
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto bg-background">
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
                  {/* This will be replaced with the actual summary for the selected asset type */}
                  <p className="text-lg font-semibold">Summary</p>
                  <p>Review all the details before issuing your asset.</p>

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("regulation")}
                    >
                      Back
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>
                      Create asset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StepItemProps {
  number: number;
  title: string;
  description?: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function StepItem({
  number,
  title,
  description,
  isActive,
  isCompleted,
  onClick,
  disabled,
}: StepItemProps) {
  return (
    <button
      className={cn(
        "flex flex-col w-full px-3 py-2 rounded-md transition-colors text-left",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
            isActive ? "border-primary-foreground" : "border-sidebar-border",
            isCompleted && "bg-primary text-primary-foreground"
          )}
        >
          {isCompleted ? "✓" : number}
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      {description && (
        <p
          className={cn(
            "text-xs mt-1 ml-9",
            isActive
              ? "text-primary-foreground/80"
              : "text-sidebar-foreground/70"
          )}
        >
          {description}
        </p>
      )}
    </button>
  );
}
