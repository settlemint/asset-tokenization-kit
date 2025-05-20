"use client";

import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createBond } from "@/lib/mutations/bond/create/create-action";
import { CreateBondSchema } from "@/lib/mutations/bond/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/bond-factory/bond-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/bond-factory/bond-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import { getTomorrowMidnight } from "@/lib/utils/date";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
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
  onOpenChange?: (open: boolean) => void;
}
export function CreateBondForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateBondFormProps) {
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
      configurationCard={<BondConfigurationCard />}
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
      action={createBond}
      resolver={typeboxResolver(CreateBondSchema())}
      defaultValues={{
        assetName: "",
        symbol: "",
        decimals: 18,
        isin: "",
        assetAdmins: [],
        selectedRegulations: [],
        maturityDate: getTomorrowMidnight(),
        verificationType: "pincode",
        predictedAddress: "0x0000000000000000000000000000000000000000",
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.bond.issue")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.bond.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.bond.submitting"),
        success: t("toasts.bond.success"),
      }}
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      {allStepComponents}
    </Form>
  );
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
