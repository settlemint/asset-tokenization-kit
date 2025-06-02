"use client";

import { CryptoConfigurationCard } from "@/components/blocks/create-forms/cryptocurrency/steps/summaryConfigurationCard";
import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import { CreateCryptoCurrencySchema } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-predict-address";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { AssetFormDefinition } from "../../asset-designer/types";
import { stepDefinition as adminsStep } from "../common/asset-admins/asset-admins";
import { stepDefinition as summaryStep } from "../common/summary/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as configurationStep } from "./steps/configuration";

interface CreateCryptoCurrencyFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function CreateCryptoCurrencyForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateCryptoCurrencyFormProps) {
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
      configurationCard={<CryptoConfigurationCard />}
      predictAddress={getPredictedAddress}
      isAddressAvailable={isAddressAvailable}
    />,
  ];

  // Define step order and mapping
  const stepIdToIndex: Record<(typeof cryptoSteps)[number]["id"], number> = {
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
      action={createCryptoCurrency}
      resolver={typeboxResolver(CreateCryptoCurrencySchema())}
      defaultValues={{
        assetName: "",
        symbol: "",
        decimals: 18,
        initialSupply: undefined,
        price: {
          amount: 1,
          currency: userDetails.currency,
        },
        verificationType: "pincode",
        predictedAddress: "0x0000000000000000000000000000000000000000",
        assetAdmins: [],
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.cryptocurrency.issue")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.cryptocurrency.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      currentStep={
        stepIdToIndex[currentStepId as keyof typeof stepIdToIndex] ?? 0
      }
      toast={{
        loading: t("toasts.cryptocurrency.submitting"),
        success: t("toasts.cryptocurrency.success"),
      }}
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      {allStepComponents}
    </Form>
  );
}

CreateCryptoCurrencyForm.displayName = "CreateCryptoCurrencyForm";

// Collect all the step definitions
const cryptoSteps = [basicsStep, configurationStep, adminsStep, summaryStep];

// Export crypto form definition for the asset designer
export const cryptoFormDefinition: AssetFormDefinition = {
  steps: cryptoSteps,
};
