"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  FileText,
  LockIcon,
  LucideCoins,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import { AssetTypeSelection } from "./steps/asset-type-selection";

// Re-use the same asset types from the original dialog
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

interface AssetDesignerWizardProps {
  onClose: () => void;
}

export function AssetDesignerWizard({ onClose }: AssetDesignerWizardProps) {
  const [currentStep, setCurrentStep] = useState<AssetDesignerStep>("type");
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(null);

  // Handle asset type selection
  const handleAssetTypeSelect = (type: AssetType) => {
    setSelectedAssetType(type);
    setCurrentStep("details");
  };

  // Get the title for the current step
  const getStepTitle = () => {
    switch (currentStep) {
      case "type":
        return "Choose Asset Type";
      case "details":
        return "Basic Information";
      case "configuration":
        return "Asset Configuration";
      case "permissions":
        return "Asset Permissions";
      case "regulation":
        return "Regulation";
      case "summary":
        return "Review & Create";
      default:
        return "Asset Designer";
    }
  };

  // Get the description for the current step
  const getStepDescription = () => {
    switch (currentStep) {
      case "type":
        return "Select the type of digital asset you want to create";
      case "details":
        return "Provide the basic details about your asset";
      case "configuration":
        return "Configure specific parameters for your asset";
      case "permissions":
        return "Define who can manage and use this asset";
      case "regulation":
        return "Configure regulatory requirements";
      case "summary":
        return "Review your asset details before creation";
      default:
        return "";
    }
  };

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    if (currentStep === "type") {
      return !selectedAssetType;
    }
    return false;
  };

  // Handle next step navigation
  const handleNext = () => {
    switch (currentStep) {
      case "type":
        setCurrentStep("details");
        break;
      case "details":
        setCurrentStep("configuration");
        break;
      case "configuration":
        setCurrentStep("permissions");
        break;
      case "permissions":
        setCurrentStep("regulation");
        break;
      case "regulation":
        setCurrentStep("summary");
        break;
      case "summary":
        // This would be submit/create logic in a real implementation
        onClose();
        break;
    }
  };

  // Handle previous step navigation
  const handlePrevious = () => {
    switch (currentStep) {
      case "details":
        setCurrentStep("type");
        break;
      case "configuration":
        setCurrentStep("details");
        break;
      case "permissions":
        setCurrentStep("configuration");
        break;
      case "regulation":
        setCurrentStep("permissions");
        break;
      case "summary":
        setCurrentStep("regulation");
        break;
    }
  };

  // Determine if a step is completed
  const isStepCompleted = (step: AssetDesignerStep) => {
    const stepOrder: AssetDesignerStep[] = [
      "type",
      "details",
      "configuration",
      "permissions",
      "regulation",
      "summary",
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);

    return stepIndex < currentIndex && selectedAssetType !== null;
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "type":
        return (
          <AssetTypeSelection
            selectedType={selectedAssetType}
            onSelect={handleAssetTypeSelect}
          />
        );
      case "details":
        // Placeholder for details step
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-accent/20 rounded-full p-6">
              <Settings className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Basic Information Step</h3>
            <p className="text-center mt-2 text-muted-foreground">
              This would contain form fields for the asset&apos;s basic
              information such as name, symbol, and decimals.
            </p>
          </div>
        );
      case "configuration":
        // Placeholder for configuration step
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-accent/20 rounded-full p-6">
              <Settings className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">
              Asset Configuration Step
            </h3>
            <p className="text-center mt-2 text-muted-foreground">
              This would contain form fields for configuring the specific
              parameters of your asset.
            </p>
          </div>
        );
      case "permissions":
        // Placeholder for permissions step
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-accent/20 rounded-full p-6">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Asset Permissions Step</h3>
            <p className="text-center mt-2 text-muted-foreground">
              This would contain form fields for setting up permissions for who
              can manage this asset.
            </p>
          </div>
        );
      case "regulation":
        // Placeholder for regulation step
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-accent/20 rounded-full p-6">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Regulation Step</h3>
            <p className="text-center mt-2 text-muted-foreground">
              This would contain form fields for configuring regulatory
              requirements for your asset.
            </p>
          </div>
        );
      case "summary":
        // Placeholder for summary step
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-accent/20 rounded-full p-6">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Review & Create</h3>
            <p className="text-center mt-2 text-muted-foreground">
              This would show a summary of all the details entered for your
              asset before creation.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - left side */}
      <div className="w-72 bg-primary-foreground border-r p-6 overflow-y-auto">
        <div className="flex items-center mb-6">
          <LucideCoins className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Asset Designer</h2>
        </div>

        <div className="space-y-1">
          <StepNavItem
            number={1}
            title="Asset Type"
            description="Choose the type of digital asset"
            icon={<LucideCoins className="h-4 w-4" />}
            isActive={currentStep === "type"}
            isCompleted={isStepCompleted("type")}
            onClick={() => setCurrentStep("type")}
            disabled={false}
          />

          <StepNavItem
            number={2}
            title="Basic Information"
            description="Name, symbol, and other details"
            icon={<Settings className="h-4 w-4" />}
            isActive={currentStep === "details"}
            isCompleted={isStepCompleted("details")}
            onClick={() => selectedAssetType && setCurrentStep("details")}
            disabled={!selectedAssetType}
          />

          <StepNavItem
            number={3}
            title="Asset Configuration"
            description="Specific parameters for your asset"
            icon={<Settings className="h-4 w-4" />}
            isActive={currentStep === "configuration"}
            isCompleted={isStepCompleted("configuration")}
            onClick={() => selectedAssetType && setCurrentStep("configuration")}
            disabled={!selectedAssetType || currentStep === "type"}
          />

          <StepNavItem
            number={4}
            title="Asset Permissions"
            description="Define administrators and permissions"
            icon={<User className="h-4 w-4" />}
            isActive={currentStep === "permissions"}
            isCompleted={isStepCompleted("permissions")}
            onClick={() => selectedAssetType && setCurrentStep("permissions")}
            disabled={
              !selectedAssetType || ["type", "details"].includes(currentStep)
            }
          />

          <StepNavItem
            number={5}
            title="Regulation"
            description="Configure regulatory requirements"
            icon={<FileText className="h-4 w-4" />}
            isActive={currentStep === "regulation"}
            isCompleted={isStepCompleted("regulation")}
            onClick={() => selectedAssetType && setCurrentStep("regulation")}
            disabled={
              !selectedAssetType ||
              ["type", "details", "configuration"].includes(currentStep)
            }
          />

          <StepNavItem
            number={6}
            title="Review & Create"
            description="Review details before creation"
            icon={<CheckCircle className="h-4 w-4" />}
            isActive={currentStep === "summary"}
            isCompleted={isStepCompleted("summary")}
            onClick={() => selectedAssetType && setCurrentStep("summary")}
            disabled={
              !selectedAssetType ||
              ["type", "details", "configuration", "permissions"].includes(
                currentStep
              )
            }
          />
        </div>

        <div className="mt-8 text-xs text-muted-foreground">
          <div className="flex items-center mb-2">
            <LockIcon className="h-3 w-3 mr-1" />
            <span>Your data is securely encrypted</span>
          </div>
          <p>We use bank-level, 256-bit encryption to keep your data safe.</p>
        </div>
      </div>

      {/* Main content - right side */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {getStepDescription()}
          </p>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">{renderStepContent()}</div>

        {/* Footer with buttons */}
        <div className="p-6 border-t flex justify-between items-center">
          <div>
            {currentStep !== "type" && (
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="default"
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="bg-primary text-primary-foreground"
            >
              {currentStep === "summary" ? "Create Asset" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step navigation item component
interface StepNavItemProps {
  number: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function StepNavItem({
  number,
  title,
  description,
  icon,
  isActive,
  isCompleted,
  onClick,
  disabled,
}: StepNavItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-full text-left rounded-md p-3 transition-colors relative",
        isActive
          ? "bg-primary-foreground border border-primary"
          : isCompleted
            ? "hover:bg-accent/50"
            : "hover:bg-accent/30",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {isCompleted ? (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-primary-foreground" />
            </div>
          ) : (
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted border border-border"
              )}
            >
              {isActive ? icon : <span className="text-xs">{number}</span>}
            </div>
          )}
        </div>

        <div>
          <div className="font-medium">{title}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
