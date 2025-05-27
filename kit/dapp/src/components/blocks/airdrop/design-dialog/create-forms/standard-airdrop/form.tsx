"use client";

import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createStandardAirdrop } from "@/lib/mutations/airdrop/create/standard/create-action";
import { CreateStandardAirdropSchema } from "@/lib/mutations/airdrop/create/standard/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import type { User } from "better-auth";
import { useTranslations } from "next-intl";
import { Basics } from "./steps/basics";

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

  // Define step order and mapping
  const stepIdToIndex = {
    details: 0,
    // recipients: 1,
    // summary: 2,
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
        asset: {
          symbol: "",
          decimals: 18,
        },
        merkleRoot: "",
        owner: "0x0000000000000000000000000000000000000000",
        verificationCode: "",
        verificationType: "pincode",
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
    </Form>
  );
}

export const standardAirdropFormDefinition = {
  steps: [
    {
      id: "basics",
      title: "basics.title",
      description: "basics.description",
    },
  ],
} as const;
