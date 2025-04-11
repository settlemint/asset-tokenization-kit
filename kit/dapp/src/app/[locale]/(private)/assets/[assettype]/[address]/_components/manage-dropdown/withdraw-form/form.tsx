"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { FormStepElement } from "@/components/blocks/form/types";
import { withdraw } from "@/lib/mutations/withdraw/withdraw-action";
import { WithdrawSchema } from "@/lib/mutations/withdraw/withdraw-schema";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Amount } from "./steps/amount";
import { Recipient } from "./steps/recipient";
import { Summary } from "./steps/summary";
import { Target } from "./steps/target";

// Define Address type locally to avoid viem dependency issues
type Address = string;

interface WithdrawFormProps {
  address: Address;
  showTarget?: boolean;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
}

export function WithdrawForm({
  address,
  showTarget = false,
  asButton = false,
  open,
  onOpenChange,
  bondDetails,
}: WithdrawFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  // Log bond details for debugging
  useEffect(() => {
    console.log("Bond Details:", {
      address,
      "underlyingAsset.decimals": bondDetails.underlyingAsset.decimals,
      "underlyingAsset.symbol": bondDetails.underlyingAsset.symbol,
      "underlyingAsset.type": bondDetails.underlyingAsset.type,
      underlyingBalance: bondDetails.underlyingBalance,
      underlyingBalanceExact: bondDetails.underlyingBalanceExact,
      totalUnderlyingNeeded: bondDetails.totalUnderlyingNeeded,
      hasSufficientUnderlying: bondDetails.hasSufficientUnderlying,
      yieldSchedule: bondDetails.yieldSchedule
        ? {
            id: bondDetails.yieldSchedule.id,
            underlyingBalance: bondDetails.yieldSchedule.underlyingBalance,
          }
        : null,
    });
  }, [address, bondDetails]);

  // Generate form steps based on yield schedule availability
  const renderFormSteps = () => {
    const steps: FormStepElement<ReturnType<typeof WithdrawSchema>>[] = [];

    // Only show the target selection if there's a yield schedule
    if (showTarget) {
      steps.push(<Target key="target" bondDetails={bondDetails} />);
    }

    // Always show recipient and amount steps
    steps.push(
      <Amount
        key="amount"
        maxAmount={Number(bondDetails.underlyingBalance)}
        decimals={bondDetails.underlyingAsset.decimals}
        symbol={bondDetails.underlyingAsset.symbol}
      />
    );
    steps.push(<Recipient key="recipient" />);
    steps.push(<Summary key="summary" bondDetails={bondDetails} />);

    return steps;
  };

  // Get initial values based on bond details
  const initialValues = {
    address,
    target: "bond" as const,
    targetAddress: address,
    underlyingAssetAddress: bondDetails.underlyingAsset.id,
    underlyingAssetType: bondDetails.underlyingAsset.type,
    assettype: "bond" as const, // Ensure assettype is included
  };

  // Disabled due to typescript errors, not necessary for the fix
  // const handleFieldChange = (form, { changedFieldName }) => {
  //   if (changedFieldName === 'target') {
  //     const target = form.getValues('target');
  //     if (target === 'bond') {
  //       form.setValue('underlyingAssetType', bondDetails.underlyingAsset.type);
  //     } else if (target === 'yield' && bondDetails.yieldSchedule) {
  //       form.setValue('underlyingAssetType', bondDetails.yieldSchedule.underlyingAsset.type);
  //     }
  //   }
  // };

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
        resolver={typeboxResolver(
          WithdrawSchema({
            maxAmount: Number(bondDetails.underlyingBalance),
            decimals: bondDetails.underlyingAsset.decimals,
          })
        )}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.withdraw"),
        }}
        defaultValues={initialValues}
      >
        {renderFormSteps()}
      </Form>
    </FormSheet>
  );
}
