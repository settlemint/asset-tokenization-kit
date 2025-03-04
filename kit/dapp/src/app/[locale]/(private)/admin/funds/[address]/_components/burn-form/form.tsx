"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { burn } from "@/lib/mutations/fund/burn/burn-action";
import { BurnSchema } from "@/lib/mutations/fund/burn/burn-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface BurnFormProps {
  address: Address;
  balance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BurnForm({
  address,
  balance,
  open,
  onOpenChange,
}: BurnFormProps) {
  const t = useTranslations("admin.funds.burn-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={burn}
        resolver={zodResolver(BurnSchema)}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
        }}
      >
        <Amount maxBurnAmount={balance} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
