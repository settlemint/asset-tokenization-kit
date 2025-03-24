"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { useSettings } from "@/hooks/use-settings";
import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import { CreateCryptoCurrencySchema } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateCryptoCurrencyFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateCryptoCurrencyForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateCryptoCurrencyFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const baseCurrency = useSettings("baseCurrency");

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.cryptocurrencies")}
      description={t("description.cryptocurrencies")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.cryptocurrencies")
      }
    >
      <Form
        action={createCryptoCurrency}
        resolver={typeboxResolver(CreateCryptoCurrencySchema())}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.cryptocurrencies"),
        }}
        defaultValues={{
          valueInBaseCurrency: 1,
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
      >
        <Basics />
        <Configuration baseCurrency={baseCurrency} />
        <Summary />
      </Form>
    </FormSheet>
  );
}
