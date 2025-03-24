"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { burn } from "@/lib/mutations/burn/burn-action";
import { BurnSchema } from "@/lib/mutations/burn/burn-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface BurnFormProps {
  address: Address;
  assettype: AssetType;
  max: number;
  decimals: number;
  symbol: string;
  disabled?: boolean;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BurnForm({
  address,
  assettype,
  max,
  decimals,
  symbol,
  disabled = false,
  asButton = false,
  open,
  onOpenChange,
}: BurnFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.burn")
      }
      title={t("title.burn")}
      description={t("description.burn")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={burn}
        resolver={typeboxResolver(BurnSchema({ maxAmount: max, decimals }))}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.burn"),
        }}
        defaultValues={{
          address,
          assettype,
        }}
      >
        <Amount max={max} decimals={decimals} symbol={symbol} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
