"use client";

import { Form } from "@/components/blocks/form/form";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/stablecoin-factory/stablecoin-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import type { FiatCurrency } from "@/lib/utils/typebox/fiat-currency";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useEffect, useState } from "react";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { StablecoinConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateStablecoinFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
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
}: CreateStablecoinFormProps) {
  // Create component instances for each step
  const BasicsComponent = basicsStep.component;
  const ConfigurationComponent = configurationStep.component;
  const AdminsComponent = adminsStep.component;
  const SummaryComponent = summaryStep.component;

  // Create an array of all step components in order for Form to manage
  const allStepComponents = [
    <BasicsComponent key="details" onNext={onNextStep} onBack={onPrevStep} />,
    <ConfigurationComponent
      key="configuration"
      onNext={onNextStep}
      onBack={onPrevStep}
    />,
    <AdminsComponent
      key="admins"
      userDetails={userDetails}
      onNext={onNextStep}
      onBack={onPrevStep}
    />,
    <SummaryComponent
      key="summary"
      configurationCard={<StablecoinConfigurationCard />}
      onBack={onPrevStep}
      onSubmit={createStablecoin}
      predictAddress={getPredictedAddress}
      isAddressAvailable={isAddressAvailable}
    />,
  ];

  // Define step order and mapping
  const stepIdToIndex = {
    details: 0,
    configuration: 1,
    admins: 2,
    summary: 3,
  };

  // Get current step index
  const currentStepIndex =
    stepIdToIndex[currentStepId as keyof typeof stepIdToIndex] || 0;
  const isLastStep = currentStepIndex === Object.keys(stepIdToIndex).length - 1;
  const [internalCurrentStep, setInternalCurrentStep] =
    useState(currentStepIndex);

  // Update internal step when parent step changes
  useEffect(() => {
    setInternalCurrentStep(currentStepIndex);
  }, [currentStepIndex]);

  /*
   * Architectural Note: Form-Managed Steps with Parent Coordination
   *
   * This component uses a hybrid approach to step management:
   *
   * 1. The Form component manages step state internally, with all validation
   *    and verification logic working properly for each step.
   *
   * 2. We pass ALL step components to the Form to enable its built-in
   *    multi-step features, including proper validation and pincode verification.
   *
   * 3. We use the onStepChange callback to notify the parent (AssetDesignerDialog)
   *    when the Form's step changes, allowing the sidebar and other external
   *    UI elements to stay in sync.
   *
   * 4. When we receive the currentStepId from the parent, we update the Form's
   *    internal step state to keep them synchronized.
   *
   * This approach gives us the best of both worlds: Form's validation and
   * security features work correctly while the parent maintains control over
   * the overall process flow.
   */
  return (
    <Form
      action={createStablecoin}
      resolver={typeboxResolver(CreateStablecoinSchema())}
      defaultValues={{
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
      }}
      buttonLabels={{
        label: currentStepId === "summary" ? "Issue Stablecoin" : "Next",
        submittingLabel: "Issuing Stablecoin...",
        processingLabel: "Processing...",
      }}
      secureForm={true}
      toastMessages={{
        loading: "Creating stablecoin...",
        success: "Stablecoin created successfully!",
      }}
      // Notify parent when form step changes
      onStepChange={(newStepIndex) => {
        // Map step index back to step ID
        const stepId = Object.entries(stepIdToIndex).find(
          ([_, index]) => index === newStepIndex
        )?.[0];

        // Notify parent of step change
        if (stepId && stepId !== currentStepId) {
          if (newStepIndex > currentStepIndex) {
            onNextStep();
          } else {
            onPrevStep();
          }
        }
      }}
      // Keep Form's internal step in sync with parent
      onAnyFieldChange={(_, context) => {
        // If the parent step doesn't match Form's internal step, update Form's step
        if (context.step !== currentStepIndex && currentStepIndex >= 0) {
          context.goToStep(currentStepIndex);
        }
      }}
    >
      {allStepComponents}
    </Form>
  );
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
