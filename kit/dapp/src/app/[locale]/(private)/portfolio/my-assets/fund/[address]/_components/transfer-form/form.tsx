"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { transfer } from "@/lib/mutations/fund/transfer/transfer-action";
import { TransferFundSchema } from "@/lib/mutations/fund/transfer/transfer-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipients } from "./steps/recipients";
import { Summary } from "./steps/summary";

interface TransferFormProps {
  address: Address;
  balance: number;
  decimals: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransferForm({
  address,
  balance,
  decimals,
  asButton = false,
  open,
  onOpenChange,
}: TransferFormProps) {
  const t = useTranslations("portfolio.my-assets.fund.transfer-form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t("trigger-label")}
      title={t("title")}
      description={t("description")}
      asButton={asButton}
    >
      <Form
        action={transfer}
        resolver={zodResolver(TransferFundSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          assetType: "fund",
          decimals,
        }}
        secureForm={true}
      >
        <Amount balance={balance} />
        <Recipients />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
