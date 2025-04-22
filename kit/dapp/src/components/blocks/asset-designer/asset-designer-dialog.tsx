"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  // Create forms for each asset type with mode set to run validation always
  const bondForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      isin: "",
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all", // Validate on all events
  });

  const cryptocurrencyForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const equityForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      cusip: "",
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const fundForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const stablecoinForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const depositForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
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
          <FormProvider {...bondForm}>
            <BondBasics />
          </FormProvider>
        );
      case "cryptocurrency":
        return (
          <FormProvider {...cryptocurrencyForm}>
            <CryptocurrencyBasics />
          </FormProvider>
        );
      case "equity":
        return (
          <FormProvider {...equityForm}>
            <EquityBasics />
          </FormProvider>
        );
      case "fund":
        return (
          <FormProvider {...fundForm}>
            <FundBasics />
          </FormProvider>
        );
      case "stablecoin":
        return (
          <FormProvider {...stablecoinForm}>
            <StablecoinBasics />
          </FormProvider>
        );
      case "deposit":
        return (
          <FormProvider {...depositForm}>
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
          <FormProvider {...bondForm}>
            <BondConfiguration />
          </FormProvider>
        );
      case "cryptocurrency":
        return (
          <FormProvider {...cryptocurrencyForm}>
            <CryptocurrencyConfiguration />
          </FormProvider>
        );
      case "equity":
        return (
          <FormProvider {...equityForm}>
            <EquityConfiguration />
          </FormProvider>
        );
      case "fund":
        return (
          <FormProvider {...fundForm}>
            <FundConfiguration />
          </FormProvider>
        );
      case "stablecoin":
        return (
          <FormProvider {...stablecoinForm}>
            <StablecoinConfiguration />
          </FormProvider>
        );
      case "deposit":
        return (
          <FormProvider {...depositForm}>
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

    return (
      <FormProvider {...form}>
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
      const currentRegulations = form.getValues().selectedRegulations || [];

      if (checked) {
        // Add the regulation if it's not already selected
        if (!currentRegulations.includes(regulationId)) {
          form.setValue(
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
        form.setValue(
          "selectedRegulations",
          currentRegulations.filter((id) => id !== regulationId),
          {
            shouldValidate: true,
            shouldDirty: true,
          }
        );
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
                  <div className="pl-8 space-y-2">
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
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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
