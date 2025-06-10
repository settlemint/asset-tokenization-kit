"use client";

import { Summary } from "@/app/[locale]/(private)/distribution/airdrops/[airdroptype]/[address]/_components/push-tokens-form/steps/summary";
import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { batchDistribute } from "@/lib/mutations/airdrop/batch-distribute/batch-distribute-action";
import { batchDistributeSchema } from "@/lib/mutations/airdrop/batch-distribute/batch-distribute-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PushTokensFormProps {
  airdrop: PushAirdrop;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function PushTokensForm({
  airdrop,
  open,
  onOpenChange,
  disabled = false,
  asButton = false,
}: PushTokensFormProps) {
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const t = useTranslations("private.airdrops.detail.forms.distribute");

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
        action={batchDistribute}
        resolver={typeboxResolver(batchDistributeSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("push-tokens"),
        }}
        defaultValues={{
          airdrop: airdrop.id,
        }}
      >
        <Summary address={airdrop.id} airdrop={airdrop} />
      </Form>
    </FormSheet>
  );
}
