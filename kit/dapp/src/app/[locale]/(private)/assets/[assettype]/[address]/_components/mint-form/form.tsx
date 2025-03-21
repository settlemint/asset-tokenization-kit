"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { mint } from "@/lib/mutations/mint/mint-action";
import { MintSchema } from "@/lib/mutations/mint/mint-schema";
import type { AssetType } from "@/lib/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipients } from "./steps/recipients";
import { Summary } from "./steps/summary";

interface MintFormProps {
  address: Address;
  assettype: AssetType;
  recipient?: Address;
  maxLimit?: number;
  asButton?: boolean;
  open?: boolean;
  decimals: number;
  symbol: string;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function MintForm({
  address,
  assettype,
  recipient,
  maxLimit,
  decimals,
  symbol,
  asButton = false,
  open,
  onOpenChange,
  disabled = false,
}: MintFormProps) {
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
        isExternallyControlled ? undefined : t("trigger-label.mint")
      }
      title={t("title.mint")}
      description={t("description.mint")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={mint}
        resolver={zodResolver(MintSchema(maxLimit))}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.mint"),
        }}
        defaultValues={{
          address,
          assettype,
          to: recipient,
        }}
      >
        {recipient
          ? [
              <Amount
                key="amount"
                maxLimit={maxLimit}
                decimals={decimals}
                symbol={symbol}
              />,
              <Summary key="summary" address={address} symbol={symbol} />,
            ]
          : [
              <Amount
                key="amount"
                maxLimit={maxLimit}
                decimals={decimals}
                symbol={symbol}
              />,
              <Recipients key="recipients" />,
              <Summary key="summary" address={address} symbol={symbol} />,
            ]}
      </Form>
    </FormSheet>
  );
}
