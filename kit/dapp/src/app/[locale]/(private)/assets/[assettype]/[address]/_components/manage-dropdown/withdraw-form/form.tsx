"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { FormStepElement } from "@/components/blocks/form/types";
import { withdraw } from "@/lib/mutations/withdraw/withdraw-action";
import { WithdrawSchema } from "@/lib/mutations/withdraw/withdraw-schema";
import type { AssetType } from "@/lib/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipient } from "./steps/recipient";
import { Summary } from "./steps/summary";
import { Target } from "./steps/target";

interface WithdrawFormProps {
  address: Address;
  underlyingAssetAddress: Address;
  underlyingAssetType: AssetType;
  yieldScheduleAddress?: Address;
  yieldUnderlyingAssetAddress?: Address;
  yieldUnderlyingAssetType?: AssetType;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WithdrawForm({
  address,
  underlyingAssetAddress,
  underlyingAssetType,
  yieldScheduleAddress,
  yieldUnderlyingAssetAddress,
  yieldUnderlyingAssetType,
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
    if (yieldScheduleAddress) {
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
        resolver={zodResolver(WithdrawSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.withdraw"),
        }}
        defaultValues={{
          address,
          underlyingAssetAddress,
          underlyingAssetType,
          yieldScheduleAddress,
          yieldUnderlyingAssetAddress,
          yieldUnderlyingAssetType,
          target: "bond",
        }}
      >
        {renderFormSteps()}
      </Form>
    </FormSheet>
  );
}
