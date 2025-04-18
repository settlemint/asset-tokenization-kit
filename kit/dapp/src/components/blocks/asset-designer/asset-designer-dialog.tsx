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

  // Create forms for each asset type with mode set to run validation always
  const bondForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      isin: "",
    },
    mode: "all", // Validate on all events
  });

  const cryptocurrencyForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
    },
    mode: "all",
  });

  const equityForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      cusip: "",
    },
    mode: "all",
  });

  const fundForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      decimals: 18,
    },
    mode: "all",
  });

  const stablecoinForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
    },
    mode: "all",
  });

  const depositForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
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
        // Trigger validation for all fields
        form.trigger();

        // For configuration, we check if there are any errors
        const hasErrors = Object.keys(errors).length > 0;

        // Check if required configuration fields are present based on asset type
        const configFieldsValid = true;
        // Asset-specific validation can be added here

        setIsConfigurationValid(configFieldsValid && !hasErrors);
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
                  {/* This will be replaced with the actual permissions form for the selected asset type */}
                  <p className="text-lg font-semibold">Asset permissions</p>
                  <p>Define who can manage and use this asset.</p>

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("configuration")}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep("regulation")}
                      // Will be disabled until permissions step is implemented
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === "regulation" && (
                <div className="p-6">
                  {/* This will be replaced with the actual regulation form for the selected asset type */}
                  <p className="text-lg font-semibold">Regulation</p>
                  <p>Configure regulatory requirements for your asset.</p>

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
