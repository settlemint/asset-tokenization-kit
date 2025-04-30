"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { StepContent } from "../step-wizard/step-content";
import type { AssetType } from "../types";

// Import configuration components
import { Configuration as BondConfiguration } from "@/components/blocks/create-forms/bond/steps/configuration";
import { Configuration as CryptocurrencyConfiguration } from "@/components/blocks/create-forms/cryptocurrency/steps/configuration";
import { Configuration as DepositConfiguration } from "@/components/blocks/create-forms/deposit/steps/configuration";
import { Configuration as EquityConfiguration } from "@/components/blocks/create-forms/equity/steps/configuration";
import { Configuration as FundConfiguration } from "@/components/blocks/create-forms/fund/steps/configuration";
import { Configuration as StablecoinConfiguration } from "@/components/blocks/create-forms/stablecoin/steps/configuration";

interface AssetConfigurationStepProps {
  assetType: AssetType;
  form: UseFormReturn<any>;
  isValid: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function AssetConfigurationStep({
  assetType,
  form,
  isValid,
  onBack,
  onNext,
}: AssetConfigurationStepProps) {
  // Render the appropriate configuration component based on asset type
  const renderConfigurationComponent = () => {
    switch (assetType) {
      case "bond":
        return <BondConfiguration />;
      case "cryptocurrency":
        return <CryptocurrencyConfiguration />;
      case "equity":
        return <EquityConfiguration />;
      case "fund":
        return <FundConfiguration />;
      case "stablecoin":
        return <StablecoinConfiguration />;
      case "deposit":
        return <DepositConfiguration />;
      default:
        return null;
    }
  };

  return (
    <StepContent
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
      centerContent={true}
    >
      <FormProvider {...form}>
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">
                {assetType
                  ? assetType.charAt(0).toUpperCase() + assetType?.slice(1)
                  : "Asset"}{" "}
                configuration
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure specific parameters for this {assetType}.
              </p>
            </CardHeader>
            <CardContent>{renderConfigurationComponent()}</CardContent>
          </Card>
        </div>
      </FormProvider>
    </StepContent>
  );
}
