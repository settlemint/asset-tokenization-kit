"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { airdropTransferOwnership } from "@/lib/mutations/airdrop/transfer-ownership/transfer-ownership-action";
import { AirdropTransferOwnershipSchema } from "@/lib/mutations/airdrop/transfer-ownership/transfer-ownership-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import type { StandardAirdrop } from "@/lib/queries/standard-airdrop/standard-airdrop-schema";
import type { VestingAirdrop } from "@/lib/queries/vesting-airdrop/vesting-airdrop-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Recipient } from "./steps/recipient";
import { Summary } from "./steps/summary";

interface TransferOwnershipFormProps {
  airdrop: PushAirdrop | StandardAirdrop | VestingAirdrop;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function TransferOwnershipForm({
  airdrop,
  open,
  onOpenChange,
  disabled = false,
  asButton = false,
}: TransferOwnershipFormProps) {
  const t = useTranslations("private.airdrops.detail.forms.transfer-ownership");
  const router = useRouter();

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
        action={airdropTransferOwnership}
        resolver={typeboxResolver(AirdropTransferOwnershipSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("title"),
        }}
        defaultValues={{
          address: airdrop.id,
          type: airdrop.type,
        }}
        onSuccess={() => {
          router.push("/distribution/airdrops");
        }}
      >
        <Recipient />
        <Summary airdrop={airdrop} />
      </Form>
    </FormSheet>
  );
}
