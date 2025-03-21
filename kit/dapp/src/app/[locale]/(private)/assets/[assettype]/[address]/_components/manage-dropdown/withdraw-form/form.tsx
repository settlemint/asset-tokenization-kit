"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { withdraw } from "@/lib/mutations/withdraw/withdraw-action";
import { WithdrawSchema } from "@/lib/mutations/withdraw/withdraw-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Recipient } from "./steps/recipient";
import { Summary } from "./steps/summary";

interface WithdrawFormProps {
  address: Address;
  underlyingAssetAddress: Address;
  decimals: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WithdrawForm({
  address,
  underlyingAssetAddress,
  decimals,
  asButton = false,
  open,
  onOpenChange,
}: WithdrawFormProps) {
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
        }}
      >
        <Recipient />
        <Amount decimals={decimals} />
        <Summary />
      </Form>
    </FormSheet>
  );
}
