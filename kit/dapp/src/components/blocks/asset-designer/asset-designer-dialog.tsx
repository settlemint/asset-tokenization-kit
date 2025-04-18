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
import { useState } from "react";
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
                  {/* This will be replaced with the actual details form for the selected asset type */}
                  <p className="text-lg font-semibold">Basic information</p>
                  <p>Provide general information about your asset.</p>

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("type")}
                    >
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep("configuration")}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              {currentStep === "configuration" && (
                <div className="p-6">
                  {/* This will be replaced with the actual configuration form for the selected asset type */}
                  <p className="text-lg font-semibold">Asset configuration</p>
                  <p>Configure specific parameters for your asset.</p>

                  {/* Navigation buttons */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("details")}
                    >
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep("permissions")}>
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
                    <Button onClick={() => setCurrentStep("regulation")}>
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
