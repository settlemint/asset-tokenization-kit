"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { FormStepElement } from "@/components/blocks/form/types";
import { withdraw } from "@/lib/mutations/withdraw/withdraw-action";
import { WithdrawSchema } from "@/lib/mutations/withdraw/withdraw-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipient } from "./steps/recipient";
import { Summary } from "./steps/summary";
import { Target } from "./steps/target";

interface WithdrawFormProps {
  address: Address;
  showTarget?: boolean;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WithdrawForm({
  address,
  showTarget = false,
  asButton = false,
  open,
  onOpenChange,
}: WithdrawFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  // Generate form steps based on yield schedule availability
  const renderFormSteps = () => {
    const steps: FormStepElement<typeof WithdrawSchema>[] = [];

    // Only show the target selection if there's a yield schedule
    if (showTarget) {
      steps.push(<Target key="target" />);
    }

    // Always show recipient and amount steps
    steps.push(<Recipient key="recipient" />);
    steps.push(<Amount key="amount" />);
    steps.push(<Summary key="summary" />);

    return steps;
  };

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.withdraw")
      }
      title={t("title.withdraw")}
      description={t("description.withdraw")}
      asButton={asButton}
    >
      <Form
        action={withdraw}
        resolver={typeboxResolver(WithdrawSchema())}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.withdraw"),
        }}
        defaultValues={{
          address,
          target: "bond",
        }}
      >
        {renderFormSteps()}
      </Form>
    </FormSheet>
  );
}
