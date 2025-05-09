"use client";

import { createFund } from "@/lib/mutations/fund/create/create-action";
import {
  CreateFundSchema,
  type CreateFundInput,
} from "@/lib/mutations/fund/create/create-schema";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { FundConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateFundFormProps {
  userDetails: User;
  currentStepId?: string; // Optional for when used in the asset designer
  onNextStep?: () => void;
  onPrevStep?: () => void;
  withVerification?: (
    fn: (data: any) => Promise<void>
  ) => (data: any) => Promise<void>;
}

// Define the interface that all steps will implement
export interface FundStepProps {
  onNext?: () => void;
  onBack?: () => void;
  userDetails?: User;
}

export function CreateFundForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  withVerification,
}: CreateFundFormProps) {
  const fundForm = useForm<CreateFundInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      fundClass: "",
      fundCategory: "",
      managementFeeBps: 100, // Default 1% management fee
      price: {
        amount: 1,
        currency: userDetails.currency,
      },
      verificationType: "pincode",
      assetAdmins: [],
    },
    mode: "onChange", // Validate as fields change for real-time feedback
    resolver: typeboxResolver(CreateFundSchema()),
  });

  const handleSubmit = async (data: CreateFundInput) => {
    try {
      const result = await createFund(data);

      if (result?.data) {
        toast.success("Fund created successfully");
        // Additional success handling can be added here
      } else {
        toast.error(result?.serverError || "Failed to create fund");
      }
    } catch (error) {
      console.error("Error creating fund:", error);
      toast.error("An unexpected error occurred");
    }
  };

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
            configurationCard={<FundConfigurationCard form={fundForm} />}
            form={fundForm}
            onBack={onPrevStep}
            onSubmit={
              withVerification ? withVerification(handleSubmit) : handleSubmit
            }
          />
        );
      default:
        return <div>Unknown step: {currentStepId}</div>;
    }
  };

  return <FormProvider {...fundForm}>{renderCurrentStep()}</FormProvider>;
}

CreateFundForm.displayName = "CreateFundForm";

// Collect all the step definitions
const fundSteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export form definition for the asset designer
export const fundFormDefinition: AssetFormDefinition = {
  steps: fundSteps,
  getStepComponent: (stepId: string) => {
    const step = fundSteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
