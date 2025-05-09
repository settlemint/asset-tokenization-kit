"use client";

import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import {
  CreateDepositSchema,
  type CreateDepositInput,
} from "@/lib/mutations/deposit/create/create-schema";
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
import { DepositConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateDepositFormProps {
  userDetails: User;
  currentStepId?: string; // Optional for when used in the asset designer
  onNextStep?: () => void;
  onPrevStep?: () => void;
  withVerification?: (
    fn: (data: any) => Promise<void>
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
  withVerification,
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
    mode: "onChange", // Validate as fields change for real-time feedback
    resolver: typeboxResolver(CreateDepositSchema()),
  });

  const handleSubmit = async (data: CreateDepositInput) => {
    try {
      const result = await createDeposit(data);

      if (result?.data) {
        toast.success("Deposit created successfully");
        // Additional success handling can be added here
      } else {
        toast.error(result?.serverError || "Failed to create deposit");
      }
    } catch (error) {
      console.error("Error creating deposit:", error);
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
            configurationCard={<DepositConfigurationCard form={depositForm} />}
            form={depositForm}
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
