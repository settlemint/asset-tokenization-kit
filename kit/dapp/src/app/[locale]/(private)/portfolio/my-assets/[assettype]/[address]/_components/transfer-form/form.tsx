"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { transfer } from "@/lib/mutations/transfer/transfer-action";
import { TransferSchema } from "@/lib/mutations/transfer/transfer-schema";
import type { AssetType } from "@/lib/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipients } from "./steps/recipients";
import { Summary } from "./steps/summary";

interface TransferFormProps {
  address: Address;
  assettype: AssetType;
  balance: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransferForm({
  address,
  assettype,
  balance,
  asButton = false,
  open,
  onOpenChange,
}: TransferFormProps) {
  const t = useTranslations("portfolio.my-assets.bond");
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
        isExternallyControlled ? undefined : t("transfer-form.trigger-label")
      }
      title={t("transfer-form.title")}
      description={t("transfer-form.description")}
      asButton={asButton}
    >
      <Form
        action={transfer}
        resolver={zodResolver(TransferSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("transfer-form.button-label"),
        }}
        defaultValues={{
          address,
          assettype,
        }}
      >
        <Amount balance={balance} />
        <Recipients />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
