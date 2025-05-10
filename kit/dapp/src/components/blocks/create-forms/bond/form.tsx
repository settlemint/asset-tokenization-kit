"use client";

import { createBond } from "@/lib/mutations/bond/create/create-action";
import {
  CreateBondSchema,
  type CreateBondInput,
} from "@/lib/mutations/bond/create/create-schema";
import type { SafeActionResult } from "@/lib/mutations/safe-action";
import { isAddressAvailable } from "@/lib/queries/bond-factory/bond-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/bond-factory/bond-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import { getTomorrowMidnight } from "@/lib/utils/date";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { FormProvider, useForm } from "react-hook-form";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { BondConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateBondFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  verificationWrapper: <T = SafeActionResult<string[]>>(
    fn: (data: any) => Promise<T>
  ) => (data: any) => Promise<void>;
}

// Define the interface that all steps will implement
export interface BondStepProps {
  onNext?: () => void;
  onBack?: () => void;
  userDetails?: User;
}

export function CreateBondForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  verificationWrapper,
}: CreateBondFormProps) {
  const bondForm = useForm<CreateBondInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      isin: "",
      assetAdmins: [],
      selectedRegulations: [],
      maturityDate: getTomorrowMidnight(),
      verificationType: "pincode",
      predictedAddress: "0x0000000000000000000000000000000000000000",
    },
    mode: "onChange", // Validate as fields change for real-time feedback
    resolver: (...args) =>
      typeboxResolver(
        CreateBondSchema({
          decimals: args[0].decimals,
        })
      )(...args),
  });

  // Create component instances for each step
  const BasicsComponent = basicsStep.component;
  const ConfigurationComponent = configurationStep.component;
  const AdminsComponent = adminsStep.component;
  const SummaryComponent = summaryStep.component;

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case "details":
        return <BasicsComponent onNext={onNextStep} onBack={onPrevStep} />;
      case "configuration":
        return (
          <ConfigurationComponent onNext={onNextStep} onBack={onPrevStep} />
        );
      case "admins":
        return (
          <AdminsComponent
            userDetails={userDetails}
            onNext={onNextStep}
            onBack={onPrevStep}
          />
        );
      case "summary":
        return (
          <SummaryComponent
            configurationCard={<BondConfigurationCard form={bondForm} />}
            form={bondForm}
            onBack={onPrevStep}
            onSubmit={verificationWrapper(createBond)}
            predictAddress={getPredictedAddress}
            isAddressAvailable={isAddressAvailable}
          />
        );
      default:
        return <div>Unknown step: {currentStepId}</div>;
    }
  };

  return <FormProvider {...bondForm}>{renderCurrentStep()}</FormProvider>;
}

CreateBondForm.displayName = "CreateBondForm";

// Collect all the step definitions
const bondSteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export bond form definition for the asset designer
export const bondFormDefinition: AssetFormDefinition = {
  steps: bondSteps,
  getStepComponent: (stepId: string) => {
    const step = bondSteps.find((s) => s.id === stepId);
    return step?.component || null;
  },
};
