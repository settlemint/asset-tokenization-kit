"use client";

import { Form } from "@/components/blocks/form/form";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createPushAirdrop } from "@/lib/mutations/airdrop/create/push/create-action";
import { CreatePushAirdropSchema } from "@/lib/mutations/airdrop/create/push/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import type { User } from "better-auth";
import { useTranslations } from "next-intl";
import { Basics } from "./steps/basics";

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
      action={createPushAirdrop}
      resolver={typeboxResolver(CreatePushAirdropSchema)}
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
      <Basics onNextStep={onNextStep} />
    </Form>
  );
}

export const pushAirdropFormDefinition = {
  steps: [
    {
      id: "basics",
      title: "basics.title",
      description: "basics.description",
    },
  ],
} as const;
