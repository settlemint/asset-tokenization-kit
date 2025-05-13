"use client";

import type { SafeActionResult } from "@/lib/mutations/safe-action";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import {
  CreateStablecoinSchema,
  type CreateStablecoinInput,
} from "@/lib/mutations/stablecoin/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/stablecoin-factory/stablecoin-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import type { FiatCurrency } from "@/lib/utils/typebox/fiat-currency";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { FormProvider, useForm } from "react-hook-form";
import type { AssetFormDefinition } from "../../asset-designer/types";
import {
  AssetAdmins,
  stepDefinition as adminsStep,
} from "../common/asset-admins/asset-admins";
import {
  Summary,
  stepDefinition as summaryStep,
} from "../common/summary/summary";
import { Basics, stepDefinition as basicsStep } from "./steps/basics";
import {
  Configuration,
  stepDefinition as configurationStep,
} from "./steps/configuration";
import { StablecoinConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateStablecoinFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  verificationWrapper: <T = SafeActionResult<string[]>>(
    fn: (data: any) => Promise<T>
  ) => (data: any) => Promise<void>;
}

export interface StablecoinStepProps {
  onNext?: () => void;
  onBack?: () => void;
  userDetails?: User;
}

export function CreateStablecoinForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  verificationWrapper,
}: CreateStablecoinFormProps) {
  const stablecoinForm = useForm<CreateStablecoinInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      collateralLivenessValue: 12,
      collateralLivenessTimeUnit: "months",
      price: {
        amount: 1,
        currency: userDetails.currency as FiatCurrency,
      },
      verificationType: "pincode",
      assetAdmins: [],
    },
    mode: "onTouched",
    resolver: typeboxResolver(CreateStablecoinSchema()),
  });

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case "details":
        return <Basics onNext={onNextStep} onBack={onPrevStep} />;
      case "configuration":
        return <Configuration onNext={onNextStep} onBack={onPrevStep} />;
      case "admins":
        return (
          <AssetAdmins
            userDetails={userDetails}
            onNext={onNextStep}
            onBack={onPrevStep}
          />
        );
      case "summary":
        return (
          <Summary
            configurationCard={
              <StablecoinConfigurationCard form={stablecoinForm} />
            }
            form={stablecoinForm}
            onBack={onPrevStep}
            onSubmit={verificationWrapper(createStablecoin)}
            predictAddress={getPredictedAddress}
            isAddressAvailable={isAddressAvailable}
          />
        );
      default:
        return <div>Unknown step: {currentStepId}</div>;
    }
  };

  return <FormProvider {...stablecoinForm}>{renderCurrentStep()}</FormProvider>;
}

CreateStablecoinForm.displayName = "CreateStablecoinForm";

// Collect all the step definitions
const stablecoinSteps = [
  basicsStep,
  configurationStep,
  adminsStep,
  summaryStep,
];

// Export form definition for the asset designer
export const stablecoinFormDefinition: AssetFormDefinition = {
  steps: stablecoinSteps,
  getStepComponent: (stepId: string) => {
    const step = stablecoinSteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
