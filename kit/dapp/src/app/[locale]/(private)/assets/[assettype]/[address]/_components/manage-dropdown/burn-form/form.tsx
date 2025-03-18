"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { burn } from "@/lib/mutations/burn/burn-action";
import { BurnSchema } from "@/lib/mutations/burn/burn-schema";
import type { AssetType } from "@/lib/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface BurnFormProps {
  address: Address;
  assettype: AssetType;
  balance: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BurnForm({
  address,
  assettype,
  balance,
  asButton = false,
  open,
  onOpenChange,
}: BurnFormProps) {
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
        isExternallyControlled ? undefined : t("trigger-label.burn")
      }
      title={t("title.burn")}
      description={t("description.burn")}
      asButton={asButton}
    >
      <Form
        action={burn}
        resolver={zodResolver(BurnSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.burn"),
        }}
        defaultValues={{
          address,
          assettype,
        }}
      >
        <Amount maxBurnAmount={balance} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
