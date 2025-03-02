"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createFund } from "@/lib/mutations/fund/create/create-action";
import { CreateFundSchema } from "@/lib/mutations/fund/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateFundFormProps {
  open: boolean;
  onCloseAction: () => void;
}

export function CreateFundForm({ open, onCloseAction }: CreateFundFormProps) {
  const t = useTranslations("admin.funds.create-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onCloseAction}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={createFund}
        resolver={zodResolver(CreateFundSchema)}
        onOpenChange={onCloseAction}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          managementFeeBps: 100, // Default 1% management fee
        }}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
