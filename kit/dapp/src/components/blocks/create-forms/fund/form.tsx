"use client";

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

import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createFund } from "@/lib/mutations/fund/create/create-action";
import { CreateFundSchema } from "@/lib/mutations/fund/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/fund-factory/fund-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/fund-factory/fund-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";
import { FundConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateFundFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateFundForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateFundFormProps) {
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
      configurationCard={<FundConfigurationCard />}
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
      action={createFund}
      resolver={typeboxResolver(CreateFundSchema())}
      defaultValues={{
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
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.fund.issue")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.fund.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.fund.submitting"),
        success: t("toasts.fund.success"),
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

CreateFundForm.displayName = "CreateFundForm";

// Collect all the step definitions
const fundSteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export form definition for the asset designer
export const fundFormDefinition: AssetFormDefinition = {
  steps: fundSteps,
};
