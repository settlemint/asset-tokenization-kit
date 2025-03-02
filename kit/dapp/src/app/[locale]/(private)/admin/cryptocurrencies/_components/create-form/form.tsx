"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createCryptoCurrency } from "@/lib/mutations/cryptocurrency/create/create-action";
import { CreateCryptoCurrencySchema } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateCryptoCurrencyFormProps {
  open: boolean;
  onCloseAction: () => void;
}

export function CreateCryptoCurrencyForm({
  open,
  onCloseAction,
}: CreateCryptoCurrencyFormProps) {
  const t = useTranslations("admin.cryptocurrencies.create-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onCloseAction}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={createCryptoCurrency}
        resolver={zodResolver(CreateCryptoCurrencySchema)}
        onOpenChange={onCloseAction}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{}}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
