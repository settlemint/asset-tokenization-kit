"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { FormStepElement } from "@/components/blocks/form/types";
import { topUpUnderlyingAsset } from "@/lib/mutations/bond/top-up/top-up-action";
import { TopUpSchema } from "@/lib/mutations/bond/top-up/top-up-schema";
import type { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Summary } from "./steps/summary";
import { Target } from "./steps/target";

interface TopUpFormProps {
  address: Address;
  showTarget?: boolean;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
  userUnderlyingAssetBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
}

export function TopUpForm({
  address,
  showTarget = false,
  asButton = false,
  open,
  onOpenChange,
  bondDetails,
  userUnderlyingAssetBalance,
}: TopUpFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const maxAmount = userUnderlyingAssetBalance?.available
    ? Number(userUnderlyingAssetBalance.available)
    : 0;

  // Generate form steps based on yield schedule availability
  const renderFormSteps = () => {
    const steps: FormStepElement<ReturnType<typeof TopUpSchema>>[] = [];

    if (showTarget) {
      steps.push(<Target key="target" />);
    }

    // steps.push(
    //   <Amount
    //     max={maxAmount}
    //     symbol={bondDetails.underlyingAsset.symbol}
    //     key="amount"
    //   />
    // );
    steps.push(<Summary key="summary" bondDetails={bondDetails} />);

    return steps;
  };

  // Get initial values based on bond details
  const initialValues = {
    address,
    target: "bond" as const,
    bondAddress: address,
    // underlyingAssetAddress: bondDetails.underlyingAsset.id,
  };

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.top-up")
      }
      title={t("title.top-up")}
      description={t("description.top-up")}
      asButton={asButton}
    >
      <Form
        action={topUpUnderlyingAsset}
        resolver={typeboxResolver(
          TopUpSchema({
            decimals: 18, // bondDetails.underlyingAsset.decimals,
            maxAmount,
          })
        )}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.top-up"),
        }}
        defaultValues={initialValues}
      >
        {renderFormSteps()}
      </Form>
    </FormSheet>
  );
}
