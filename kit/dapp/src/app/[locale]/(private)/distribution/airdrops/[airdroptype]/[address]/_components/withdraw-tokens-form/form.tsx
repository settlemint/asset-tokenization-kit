"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { withdrawTokensFromAirdrop } from "@/lib/mutations/airdrop/withdraw-token/withdraw-token-action";
import { WithdrawTokenFromAirdropSchema } from "@/lib/mutations/airdrop/withdraw-token/withdraw-token-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface WithdrawTokensFormProps {
  airdrop: PushAirdrop;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function WithdrawTokensForm({
  airdrop,
  open,
  onOpenChange,
  disabled = false,
  asButton = false,
}: WithdrawTokensFormProps) {
  const t = useTranslations("private.airdrops.detail.forms.withdraw-tokens");

  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : "Push"}
      title={t("title")}
      description={t("description")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={withdrawTokensFromAirdrop}
        resolver={typeboxResolver(
          WithdrawTokenFromAirdropSchema({
            maxAmount: airdrop.balance,
            decimals: airdrop.asset.decimals,
          })
        )}
        buttonLabels={{
          label: t("title"),
        }}
        defaultValues={{
          airdrop: airdrop.id,
        }}
      >
        <Amount
          balance={airdrop.balance}
          decimals={airdrop.asset.decimals}
          symbol={airdrop.asset.symbol}
        />
        <Summary airdrop={airdrop} />
      </Form>
    </FormSheet>
  );
}
