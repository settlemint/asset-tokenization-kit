"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { mint } from "@/lib/mutations/cryptocurrency/mint/mint-action";
import { MintSchema } from "@/lib/mutations/cryptocurrency/mint/mint-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Amount } from "./steps/amount";
import { Summary } from "./steps/summary";

interface MintFormProps {
  address: Address;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MintForm({ address, open, onOpenChange }: MintFormProps) {
  const t = useTranslations("admin.cryptocurrencies.mint-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={mint}
        resolver={zodResolver(MintSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
        }}
      >
        <Amount />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
