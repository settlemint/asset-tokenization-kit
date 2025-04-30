"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { StepContent } from "../step-wizard/step-content";
import type { AssetType } from "../types";

// Import Permission component
import { AssetAdmins } from "@/components/blocks/create-forms/common/asset-admins/asset-admins";

interface AssetPermissionsStepProps {
  assetType: AssetType;
  form: UseFormReturn<any>;
  isValid: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function AssetPermissionsStep({
  assetType,
  form,
  isValid,
  onBack,
  onNext,
}: AssetPermissionsStepProps) {
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
            <h3 className="text-lg font-medium mb-2">Asset Administrators</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Specify administrators that can manage this {assetType}. These
              addresses will be granted admin roles.
            </p>

            <AssetAdmins />
          </div>
        </div>
      </FormProvider>
    </StepContent>
  );
}
