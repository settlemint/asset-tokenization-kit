"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { topUpUnderlyingAsset } from "@/lib/mutations/bond/top-up/top-up-action";
import { TopUpSchema } from "@/lib/mutations/bond/top-up/top-up-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface TopUpFormProps {
  address: Address;
  underlyingAssetAddress: Address;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TopUpForm({
  address,
  underlyingAssetAddress,
  asButton = false,
  open,
  onOpenChange,
}: TopUpFormProps) {
  const t = useTranslations("admin.bonds.top-up-form");
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
        action={topUpUnderlyingAsset}
        resolver={zodResolver(TopUpSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          underlyingAssetAddress,
        }}
        secureForm={true}
      >
        <Amount />
        <Summary />
      </Form>
    </FormSheet>
  );
}
