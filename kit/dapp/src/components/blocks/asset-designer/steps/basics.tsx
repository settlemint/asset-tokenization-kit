"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { StepContent } from "../step-wizard/step-content";
import type { AssetType } from "../types";

// Import form steps for each asset type
import { Basics as BondBasics } from "@/components/blocks/create-forms/bond/steps/basics";
import { Basics as CryptocurrencyBasics } from "@/components/blocks/create-forms/cryptocurrency/steps/basics";
import { Basics as DepositBasics } from "@/components/blocks/create-forms/deposit/steps/basics";
import { Basics as EquityBasics } from "@/components/blocks/create-forms/equity/steps/basics";
import { Basics as FundBasics } from "@/components/blocks/create-forms/fund/steps/basics";
import { Basics as StablecoinBasics } from "@/components/blocks/create-forms/stablecoin/steps/basics";

interface AssetBasicsStepProps {
  assetType: AssetType;
  form: UseFormReturn<any>;
  isValid: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function AssetBasicsStep({
  assetType,
  form,
  isValid,
  onBack,
  onNext,
}: AssetBasicsStepProps) {
  // Render the appropriate basics component for the selected asset type
  const renderBasicsComponent = () => {
    switch (assetType) {
      case "bond":
        return <BondBasics />;
      case "cryptocurrency":
        return <CryptocurrencyBasics />;
      case "equity":
        return <EquityBasics />;
      case "fund":
        return <FundBasics />;
      case "stablecoin":
        return <StablecoinBasics />;
      case "deposit":
        return <DepositBasics />;
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
          <div>
            <h3 className="text-lg font-medium mb-2">Basic information</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Specify the basic information for this {assetType}.
            </p>

            {renderBasicsComponent()}
          </div>
        </div>
      </FormProvider>
    </StepContent>
  );
}
