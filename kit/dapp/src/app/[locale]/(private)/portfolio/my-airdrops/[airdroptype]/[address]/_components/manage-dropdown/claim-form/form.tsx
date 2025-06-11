"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { claimAirdrop } from "@/lib/mutations/airdrop/claim/claim-action";
import { ClaimAirdropSchema } from "@/lib/mutations/airdrop/claim/claim-schema";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface ClaimFormProps {
  address: Address;
  index: bigint;
  amount: number;
  amountExact: bigint;
  recipient: Address;
  configurationCard: React.ReactNode;
  airdropType: AirdropType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
  asTableAction?: boolean;
}

export function ClaimForm({
  address,
  index,
  amount,
  amountExact,
  recipient,
  airdropType,
  open,
  onOpenChange,
  configurationCard,
  asButton,
  asTableAction,
}: ClaimFormProps) {
  const t = useTranslations("portfolio.my-airdrops.details.forms.form");
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
        isExternallyControlled ? undefined : t("trigger-label.claim")
      }
      title={t("title.claim")}
      description={t("description.claim")}
      asButton={asButton}
      asTableAction={asTableAction}
    >
      <Form
        action={claimAirdrop}
        resolver={typeboxResolver(ClaimAirdropSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("trigger-label.claim"),
        }}
        defaultValues={{
          airdrop: address,
          index,
          amount,
          amountExact,
          recipient,
          airdropType,
        }}
      >
        <Summary configurationCard={configurationCard} />
      </Form>
    </FormSheet>
  );
}
