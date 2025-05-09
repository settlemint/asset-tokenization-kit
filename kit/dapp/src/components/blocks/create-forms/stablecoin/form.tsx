"use client";

import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import {
  CreateStablecoinSchema,
  type CreateStablecoinInput,
} from "@/lib/mutations/stablecoin/create/create-schema";
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
import { StablecoinConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateStablecoinFormProps {
  userDetails: User;
  currentStepId?: string; // Optional for when used in the asset designer
  onNextStep?: () => void;
  onPrevStep?: () => void;
  withVerification?: (
    fn: (data: any) => Promise<void>
  ) => (data: any) => Promise<void>;
}

// Define the interface that all steps will implement
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
  withVerification,
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
        currency: userDetails.currency,
      },
      verificationType: "pincode",
      assetAdmins: [],
    },
    mode: "onChange", // Validate as fields change for real-time feedback
    resolver: typeboxResolver(CreateStablecoinSchema()),
  });

  const handleSubmit = async (data: CreateStablecoinInput) => {
    try {
      console.log("Stablecoin form handleSubmit called with data:", data);
      const result = await createStablecoin(data);

      if (result?.data) {
        toast.success("Stablecoin created successfully");
        // Additional success handling can be added here
      } else {
        toast.error(result?.serverError || "Failed to create stablecoin");
      }
    } catch (error) {
      console.error("Error creating stablecoin:", error);
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
            configurationCard={
              <StablecoinConfigurationCard form={stablecoinForm} />
            }
            form={stablecoinForm}
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
