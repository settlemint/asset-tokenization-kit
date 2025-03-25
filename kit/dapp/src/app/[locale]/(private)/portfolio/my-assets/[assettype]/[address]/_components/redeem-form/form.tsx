"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { redeem } from "@/lib/mutations/bond/redeem/redeem-action";
import { RedeemBondSchema } from "@/lib/mutations/bond/redeem/redeem-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface RedeemFormProps {
  address: Address;
  balance: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function RedeemForm({
  address,
  balance,
  asButton = false,
  open,
  onOpenChange,
  disabled = false,
}: RedeemFormProps) {
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
        isExternallyControlled ? undefined : t("redeem-form.trigger-label")
      }
      title={t("redeem-form.title")}
      description={t("redeem-form.description")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={redeem}
        resolver={typeboxResolver(RedeemBondSchema())}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("redeem-form.button-label"),
        }}
        defaultValues={{
          address,
        }}
      >
        <Amount balance={balance} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
