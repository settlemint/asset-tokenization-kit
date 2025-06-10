"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { claimAirdrop } from "@/lib/mutations/airdrop/claim/claim-action";
import { ClaimAirdropSchema } from "@/lib/mutations/airdrop/claim/claim-schema";
import type { getUserAirdropDetail } from "@/lib/queries/airdrop/user-airdrop-detail";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface ClaimFormProps {
  address: Address;
  airdropDetails: Awaited<ReturnType<typeof getUserAirdropDetail>>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimForm({
  address,
  airdropDetails,
  open,
  onOpenChange,
}: ClaimFormProps) {
  const t = useTranslations("portfolio.my-airdrops.details.forms.form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("title.claim")}
      description={t("description.claim")}
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
          index: airdropDetails.index,
          amount: airdropDetails.amount,
          amountExact: airdropDetails.amountExact.toString(),
          recipient: airdropDetails.recipient,
          airdropType: airdropDetails.airdrop.type,
        }}
      >
        <Summary airdropDetails={airdropDetails} />
      </Form>
    </FormSheet>
  );
}
