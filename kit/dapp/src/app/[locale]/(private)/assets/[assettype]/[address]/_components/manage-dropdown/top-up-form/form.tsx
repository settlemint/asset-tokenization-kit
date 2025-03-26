"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { FormStepElement } from "@/components/blocks/form/types";
import { topUpUnderlyingAsset } from "@/lib/mutations/bond/top-up/top-up-action";
import { TopUpSchema } from "@/lib/mutations/bond/top-up/top-up-schema";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";
import { Target } from "./steps/target";

interface TopUpFormProps {
  address: Address;
  showTarget?: boolean;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  bondDetails: Awaited<ReturnType<typeof getBondDetail>>;
}

export function TopUpForm({
  address,
  showTarget = false,
  asButton = false,
  open,
  onOpenChange,
  bondDetails,
}: TopUpFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  // Generate form steps based on yield schedule availability
  const renderFormSteps = () => {
    const steps: FormStepElement<ReturnType<typeof TopUpSchema>>[] = [];

    if (showTarget) {
      steps.push(<Target key="target" bondDetails={bondDetails}/>);
    }

    steps.push(<Amount key="amount" />);
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
        resolver={typeboxResolver(TopUpSchema())}
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
