"use client";

import { Form } from "@/components/blocks/form/form";
import type { User } from "@/lib/auth/types";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createStandardAirdrop } from "@/lib/mutations/airdrop/create/standard/create-action";
import {
  CreateStandardAirdropSchema,
  type CreateStandardAirdropInput,
} from "@/lib/mutations/airdrop/create/standard/create-schema";
import { isAddressAvailable } from "@/lib/queries/airdrop-factory/standard/is-address-available";
import { getPredictedAddress } from "@/lib/queries/airdrop-factory/standard/predict-address";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import type { AirdropFormDefinition } from "../../types";
import { stepDefinition as distributionStep } from "../common/distribution";
import { stepDefinition as summaryStep } from "../common/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { StandardAirdropConfigurationCard } from "./steps/summaryConfigurationCard";

interface CreateStandardAirdropFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange: (open: boolean) => void;
}

export function CreateStandardAirdropForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateStandardAirdropFormProps) {
  const t = useTranslations("private.airdrops.create.form");

  // Create component instances for each step
  const BasicsComponent = basicsStep.component;
  const DistributionComponent = distributionStep.component;
  const SummaryComponent = summaryStep.component;

  // Create an array of all step components in order for Form to manage
  const allStepComponents = [
    <BasicsComponent key="details" />,
    <DistributionComponent key="distribution" />,
    <SummaryComponent
      key="summary"
      configurationCard={<StandardAirdropConfigurationCard />}
      isAddressAvailable={async (
        form: UseFormReturn<CreateStandardAirdropInput>
      ) => {
        const values = form.getValues();
        const predictedAddress = await getPredictedAddress(values);
        const isAvailable = await isAddressAvailable(predictedAddress);
        return isAvailable ? predictedAddress : false;
      }}
    />,
  ];

  // Define step order and mapping
  const stepIdToIndex: Record<
    (typeof standardAirdropFormDefinition.steps)[number]["id"],
    number
  > = {
    basics: 0,
    distribution: 1,
    summary: 2,
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
      action={createStandardAirdrop}
      resolver={typeboxResolver(CreateStandardAirdropSchema)}
      defaultValues={{
        owner: userDetails.wallet,
        airdropType: "standard",
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.standard.create")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.standard.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.standard.submitting"),
        success: t("toasts.standard.success"),
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

export const standardAirdropSteps = [
  basicsStep,
  distributionStep,
  summaryStep,
] as const;

export const standardAirdropFormDefinition: AirdropFormDefinition = {
  steps: standardAirdropSteps,
};
