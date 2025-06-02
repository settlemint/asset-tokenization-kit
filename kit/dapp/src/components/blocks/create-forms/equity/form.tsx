"use client";

import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createEquity } from "@/lib/mutations/equity/create/create-action";
import { CreateEquitySchema } from "@/lib/mutations/equity/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/equity-factory/equity-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/equity-factory/equity-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { EquityConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateEquityFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateEquityForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateEquityFormProps) {
  const t = useTranslations("private.assets.create.form");

  // Create component instances for each step
  const BasicsComponent = basicsStep.component;
  const ConfigurationComponent = configurationStep.component;
  const AdminsComponent = adminsStep.component;
  const SummaryComponent = summaryStep.component;

  // Create an array of all step components in order for Form to manage
  const allStepComponents = [
    <BasicsComponent key="details" />,
    <ConfigurationComponent key="configuration" />,
    <AdminsComponent key="admins" userDetails={userDetails} />,
    <SummaryComponent
      key="summary"
      configurationCard={<EquityConfigurationCard />}
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

  // Use the step synchronization hook
  const { isLastStep, onStepChange, onAnyFieldChange } = useFormStepSync({
    currentStepId,
    stepIdToIndex,
    onNextStep,
    onPrevStep,
  });

  return (
    <Form
      action={createEquity}
      resolver={typeboxResolver(CreateEquitySchema())}
      defaultValues={{
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
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.equity.issue")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.equity.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.equity.submitting"),
        success: t("toasts.equity.success"),
      }}
      currentStep={
        stepIdToIndex[currentStepId as keyof typeof stepIdToIndex] ?? 0
      }
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      {allStepComponents}
    </Form>
  );
}

CreateEquityForm.displayName = "CreateEquityForm";

// Collect all the step definitions
const equitySteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export form definition for the asset designer
export const equityFormDefinition: AssetFormDefinition = {
  steps: equitySteps,
};
