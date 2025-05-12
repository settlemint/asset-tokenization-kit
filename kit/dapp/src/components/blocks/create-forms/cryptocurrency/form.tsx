"use client";

import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import {
  CreateCryptoCurrencySchema,
  type CreateCryptoCurrencyInput,
} from "@/lib/mutations/cryptocurrency/create/create-schema";
import type { SafeActionResult } from "@/lib/mutations/safe-action";
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
import { CryptoConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateCryptoCurrencyFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  verificationWrapper: <T = SafeActionResult<string[]>>(
    fn: (data: any) => Promise<T>
  ) => (data: any) => Promise<void>;
}

// Define the interface that all steps will implement
export interface CryptoStepProps {
  onNext?: () => void;
  onBack?: () => void;
  userDetails?: User;
}

export function CreateCryptoCurrencyForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  verificationWrapper,
}: CreateCryptoCurrencyFormProps) {
  const cryptoForm = useForm<CreateCryptoCurrencyInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      initialSupply: undefined,
      price: {
        amount: 1,
        currency: userDetails.currency,
      },
      verificationType: "pincode",
      predictedAddress: "0x0000000000000000000000000000000000000000",
      assetAdmins: [],
    },
    mode: "onChange", // Validate as fields change for real-time feedback
    resolver: (...args) =>
      typeboxResolver(
        CreateCryptoCurrencySchema({
          decimals: args[0].decimals,
        })
      )(...args),
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
            configurationCard={<CryptoConfigurationCard form={cryptoForm} />}
            form={cryptoForm}
            onBack={onPrevStep}
            onSubmit={verificationWrapper(createCryptoCurrency)}
          />
        );
      default:
        return <div>Unknown step: {currentStepId}</div>;
    }
  };

  return <FormProvider {...cryptoForm}>{renderCurrentStep()}</FormProvider>;
}

CreateCryptoCurrencyForm.displayName = "CreateCryptoCurrencyForm";

// Collect all the step definitions
const cryptoSteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export crypto form definition for the asset designer
export const cryptoFormDefinition: AssetFormDefinition = {
  steps: cryptoSteps,
  getStepComponent: (stepId: string) => {
    const step = cryptoSteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
