"use client";

import { createEquity } from "@/lib/mutations/equity/create/create-action";
import {
  CreateEquitySchema,
  type CreateEquityInput,
} from "@/lib/mutations/equity/create/create-schema";
import type { SafeActionResult } from "@/lib/mutations/safe-action";
import { isAddressAvailable } from "@/lib/queries/equity-factory/equity-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/equity-factory/equity-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
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
import { EquityConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateEquityFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  verificationWrapper: <T = SafeActionResult<string[]>>(
    fn: (data: any) => Promise<T>
  ) => (data: any) => Promise<void>;
}
// Define the interface that all steps will implement
export interface EquityStepProps {
  onNext?: () => void;
  onBack?: () => void;
  userDetails?: User;
}

export function CreateEquityForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  verificationWrapper,
}: CreateEquityFormProps) {
  const equityForm = useForm<CreateEquityInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      equityClass: "",
      equityCategory: "",
      price: {
        amount: 1,
        currency: userDetails.currency,
      },
      verificationType: "pincode",
      assetAdmins: [],
    },
    mode: "onChange", // Validate as fields change for real-time feedback
    resolver: typeboxResolver(CreateEquitySchema()),
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
            configurationCard={<EquityConfigurationCard form={equityForm} />}
            form={equityForm}
            onBack={onPrevStep}
            onSubmit={verificationWrapper(createEquity)}
            predictAddress={getPredictedAddress}
            isAddressAvailable={isAddressAvailable}
          />
        );
      default:
        return <div>Unknown step: {currentStepId}</div>;
    }
  };

  return <FormProvider {...equityForm}>{renderCurrentStep()}</FormProvider>;
}

CreateEquityForm.displayName = "CreateEquityForm";

// Collect all the step definitions
const equitySteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export form definition for the asset designer
export const equityFormDefinition: AssetFormDefinition = {
  steps: equitySteps,
  getStepComponent: (stepId: string) => {
    const step = equitySteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
