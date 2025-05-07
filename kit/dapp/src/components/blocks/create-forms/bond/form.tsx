"use client";

import {
  CreateBondSchema,
  type CreateBondInput,
} from "@/lib/mutations/bond/create/create-schema";
import type { User } from "@/lib/queries/user/user-schema";
import { getTomorrowMidnight } from "@/lib/utils/date";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { createContext, useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { stepDefinition as summaryStep } from "./steps/summary";

// Create form context to share bond form across steps
interface BondFormContextType {
  form: ReturnType<typeof useForm<CreateBondInput>>;
  userDetails?: User;
}

const BondFormContext = createContext<BondFormContextType | null>(null);

export const useBondForm = () => {
  const context = useContext(BondFormContext);
  if (!context) {
    throw new Error("useBondForm must be used within a BondFormProvider");
  }
  return context;
};

interface CreateBondFormProps {
  userDetails: User;
  currentStepId?: string; // Optional for when used in the asset designer
}

export function CreateBondForm({
  userDetails,
  currentStepId,
}: CreateBondFormProps) {
  // Using any type to avoid TypeScript errors with extra fields
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
      // Extra field used by AssetAdmins but not part of the schema validation
    },
    mode: "all", // Validate on all events
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

  // If we have a currentStepId, only render that specific step (for asset designer)
  const renderCurrentStep = () => {
    if (!currentStepId) {
      // If no currentStepId, render all steps (standard behavior)
      return (
        <div className="space-y-6">
          <BasicsComponent />
          <ConfigurationComponent />
          <AdminsComponent userDetails={userDetails} />
          <SummaryComponent userDetails={userDetails} />
        </div>
      );
    }

    // Only render the requested step (for asset designer)
    switch (currentStepId) {
      case "details":
        return <BasicsComponent />;
      case "configuration":
        return <ConfigurationComponent />;
      case "admins":
        return <AdminsComponent userDetails={userDetails} />;
      case "review":
        return <SummaryComponent userDetails={userDetails} />;
      default:
        return <div>Unknown step: {currentStepId}</div>;
    }
  };

  return (
    <BondFormContext.Provider value={{ form: bondForm, userDetails }}>
      <FormProvider {...bondForm}>{renderCurrentStep()}</FormProvider>
    </BondFormContext.Provider>
  );
}

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
