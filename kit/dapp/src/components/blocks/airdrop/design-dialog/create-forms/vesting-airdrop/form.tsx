"use client";

import { Form } from "@/components/blocks/form/form";
import type { User } from "@/lib/auth/types";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createVestingAirdrop } from "@/lib/mutations/airdrop/create/vesting/create-action";
import {
  CreateVestingAirdropSchema,
  type CreateVestingAirdropInput,
} from "@/lib/mutations/airdrop/create/vesting/create-schema";
import { isAddressAvailable } from "@/lib/queries/airdrop-factory/vesting/is-address-available";
import { getPredictedAddress } from "@/lib/queries/airdrop-factory/vesting/predict-address";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import type { AirdropFormDefinition } from "../../types";
import { stepDefinition as distributionStep } from "../common/distribution";
import { stepDefinition as summaryStep } from "../common/summary";
import { stepDefinition as basicsStep } from "./steps/basics";
import { VestingAirdropConfigurationCard } from "./steps/summaryConfigurationCard";
import { stepDefinition as vestingStep } from "./steps/vesting";

interface CreateVestingAirdropFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange: (open: boolean) => void;
}

export function CreateVestingAirdropForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateVestingAirdropFormProps) {
  const t = useTranslations("private.airdrops.create.form");

  // Create component instances for each step
  const BasicsComponent = basicsStep.component;
  const VestingComponent = vestingStep.component;
  const DistributionComponent = distributionStep.component;
  const SummaryComponent = summaryStep.component;

  // Create an array of all step components in order for Form to manage
  const allStepComponents = [
    <BasicsComponent key="details" />,
    <VestingComponent key="vesting" />,
    <DistributionComponent key="distribution" />,
    <SummaryComponent
      key="summary"
      configurationCard={<VestingAirdropConfigurationCard />}
      isAddressAvailable={async (
        form: UseFormReturn<CreateVestingAirdropInput>
      ) => {
        const values = form.getValues();
        const predictedAddress = await getPredictedAddress(values);
        const isAvailable = await isAddressAvailable(predictedAddress);
        return isAvailable ? predictedAddress : false;
      }}
    />,
  ];

  const stepIdToIndex: Record<
    (typeof vestingAirdropFormDefinition.steps)[number]["id"],
    number
  > = {
    basics: 0,
    vesting: 1,
    distribution: 2,
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
      action={createVestingAirdrop}
      resolver={typeboxResolver(CreateVestingAirdropSchema)}
      defaultValues={{
        owner: userDetails.wallet,
        airdropType: "vesting",
      }}
      buttonLabels={{
        label: isLastStep
          ? t("button-labels.vesting.create")
          : t("button-labels.general.next"),
        submittingLabel: t("button-labels.vesting.submitting"),
        processingLabel: t("button-labels.general.processing"),
      }}
      secureForm={true}
      hideStepProgress={true}
      toast={{
        loading: t("toasts.vesting.submitting"),
        success: t("toasts.vesting.success"),
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

const vestingSteps = [
  basicsStep,
  vestingStep,
  distributionStep,
  summaryStep,
] as const;

export const vestingAirdropFormDefinition: AirdropFormDefinition = {
  steps: vestingSteps,
};
