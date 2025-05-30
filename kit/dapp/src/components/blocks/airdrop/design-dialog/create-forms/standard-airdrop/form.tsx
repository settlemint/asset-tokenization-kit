"use client";

import { Form } from "@/components/blocks/form/form";
import type { User } from "@/lib/auth/types";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createStandardAirdrop } from "@/lib/mutations/airdrop/create/standard/create-action";
import { CreateStandardAirdropSchema } from "@/lib/mutations/airdrop/create/standard/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { Distribution } from "../common/distribution";
import { Basics } from "./steps/basics";
import { Summary } from "./steps/summary";

interface CreateStandardAirdropFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange: (open: boolean) => void;
}

export const standardAirdropFormDefinition = {
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

export function CreateStandardAirdropForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateStandardAirdropFormProps) {
  const t = useTranslations("private.airdrops.create.form");

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
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      <Basics />
      <Distribution />
      <Summary />
    </Form>
  );
}
