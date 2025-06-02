"use client";

import type { AirdropFormDefinition } from "@/components/blocks/airdrop/design-dialog/types";
import { Form } from "@/components/blocks/form/form";
import type { User } from "@/lib/auth/types";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createPushAirdrop } from "@/lib/mutations/airdrop/create/push/create-action";
import {
  CreatePushAirdropSchema,
  type CreatePushAirdropInput,
} from "@/lib/mutations/airdrop/create/push/create-schema";
import { isAddressAvailable } from "@/lib/queries/airdrop-factory/push/is-address-available";
import { getPredictedAddress } from "@/lib/queries/airdrop-factory/push/predict-address";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { stepDefinition as summaryStep } from "../common/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { stepDefinition as distributionStep } from "./steps/distribution";

interface CreatePushAirdropFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange: (open: boolean) => void;
}

export function CreatePushAirdropForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreatePushAirdropFormProps) {
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
      isAddressAvailable={async (
        form: UseFormReturn<CreatePushAirdropInput>
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
    (typeof pushAirdropFormDefinition.steps)[number]["id"],
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
      action={createPushAirdrop}
      resolver={typeboxResolver(CreatePushAirdropSchema)}
      defaultValues={{
        owner: userDetails.wallet,
        airdropType: "push",
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.push.create")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.push.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.push.submitting"),
        success: t("toasts.push.success"),
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

export const pushAirdropSteps = [
  basicsStep,
  distributionStep,
  summaryStep,
] as const;

export const pushAirdropFormDefinition: AirdropFormDefinition = {
  steps: pushAirdropSteps,
};
