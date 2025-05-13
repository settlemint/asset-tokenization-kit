"use client";

import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import {
  CreateDepositSchema,
  type CreateDepositInput,
} from "@/lib/mutations/deposit/create/create-schema";
import type { SafeActionResult } from "@/lib/mutations/safe-action";
import { isAddressAvailable } from "@/lib/queries/deposit-factory/deposit-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/deposit-factory/deposit-factory-predict-address";
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
import { DepositConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateDepositFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  verificationWrapper: <T = SafeActionResult<string[]>>(
    fn: (data: any) => Promise<T>
  ) => (data: any) => Promise<void>;
}

// Define the interface that all steps will implement
export interface DepositStepProps {
  onNext?: () => void;
  onBack?: () => void;
  userDetails?: User;
}

export function CreateDepositForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  verificationWrapper,
}: CreateDepositFormProps) {
  const depositForm = useForm<CreateDepositInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      collateralLivenessValue: 12,
      collateralLivenessTimeUnit: "months",
      price: {
        amount: 1,
        currency: userDetails.currency,
      },
      verificationType: "pincode",
      assetAdmins: [],
    },
    mode: "onTouched",
    resolver: typeboxResolver(CreateDepositSchema()),
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
            configurationCard={<DepositConfigurationCard form={depositForm} />}
            form={depositForm}
            onBack={onPrevStep}
            onSubmit={verificationWrapper(createDeposit)}
            predictAddress={getPredictedAddress}
            isAddressAvailable={isAddressAvailable}
          />
        );
      default:
        return <div>Unknown step: {currentStepId}</div>;
    }
  };

  return <FormProvider {...depositForm}>{renderCurrentStep()}</FormProvider>;
}

CreateDepositForm.displayName = "CreateDepositForm";

// Collect all the step definitions
const depositSteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export form definition for the asset designer
export const depositFormDefinition: AssetFormDefinition = {
  steps: depositSteps,
  getStepComponent: (stepId: string) => {
    const step = depositSteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
