"use client";

import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import { CreateDepositSchema } from "@/lib/mutations/deposit/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/deposit-factory/deposit-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/deposit-factory/deposit-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { DepositConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateDepositFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateDepositForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateDepositFormProps) {
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
      configurationCard={<DepositConfigurationCard />}
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
      action={createDeposit}
      resolver={typeboxResolver(CreateDepositSchema())}
      defaultValues={{
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
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.deposit.issue")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.deposit.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toastMessages={{
        loading: t("toasts.deposit.submitting"),
        success: t("toasts.deposit.success"),
      }}
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      {allStepComponents}
    </Form>
  );
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
