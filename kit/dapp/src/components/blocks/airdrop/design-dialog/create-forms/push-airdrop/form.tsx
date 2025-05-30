"use client";

import { Form } from "@/components/blocks/form/form";
import type { User } from "@/lib/auth/types";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createPushAirdrop } from "@/lib/mutations/airdrop/create/push/create-action";
import { CreatePushAirdropSchema } from "@/lib/mutations/airdrop/create/push/create-schema";
import { isAddressAvailable } from "@/lib/queries/airdrop-factory/push/is-address-available";
import { getPredictedAddress } from "@/lib/queries/airdrop-factory/push/predict-address";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { Summary } from "../common/summary";
import { Basics } from "./steps/basics";
import { Distribution } from "./steps/distribution";

interface CreatePushAirdropFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange: (open: boolean) => void;
}

export const pushAirdropFormDefinition = {
  steps: [
    {
      id: "basics",
      title: "basics.title",
      description: "basics.description",
    },
    {
      id: "distribution",
      title: "distribution.title",
      description: "distribution.description",
    },
    {
      id: "summary",
      title: "summary.title",
      description: "summary.description",
    },
  ],
} as const;

export function CreatePushAirdropForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreatePushAirdropFormProps) {
  const t = useTranslations("private.airdrops.create.form");

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
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      <Basics />
      <Distribution />
      <Summary
        predictAddress={getPredictedAddress}
        isAddressAvailable={isAddressAvailable}
      />
    </Form>
  );
}
