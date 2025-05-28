"use client";

import { Form } from "@/components/blocks/form/form";
import type { User } from "@/lib/auth/types";
import { useFormStepSync } from "@/lib/hooks/use-form-step-sync";
import { createVestingAirdrop } from "@/lib/mutations/airdrop/create/vesting/create-action";
import { CreateVestingAirdropSchema } from "@/lib/mutations/airdrop/create/vesting/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { Distribution } from "../common/distribution";
import { Basics } from "./steps/basics";
import { Summary } from "./steps/summary";
import { Vesting } from "./steps/vesting";

interface CreateVestingAirdropFormProps {
  userDetails: User;
  currentStepId: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  onOpenChange: (open: boolean) => void;
}

export const vestingAirdropFormDefinition = {
  steps: [
    {
      id: "basics",
      title: "basics.title",
      description: "basics.description",
    },
    {
      id: "vesting",
      title: "vesting.title",
      description: "vesting.description",
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

export function CreateVestingAirdropForm({
  userDetails,
  currentStepId,
  onNextStep,
  onPrevStep,
  onOpenChange,
}: CreateVestingAirdropFormProps) {
  const t = useTranslations("private.airdrops.create.form");

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
      onStepChange={onStepChange}
      onAnyFieldChange={onAnyFieldChange}
      onOpenChange={onOpenChange}
    >
      <Basics />
      <Vesting />
      <Distribution />
      <Summary />
    </Form>
  );
}
