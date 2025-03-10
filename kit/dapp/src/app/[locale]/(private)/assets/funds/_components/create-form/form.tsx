"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createFund } from "@/lib/mutations/fund/create/create-action";
import { CreateFundSchema } from "@/lib/mutations/fund/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateFundFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateFundForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateFundFormProps) {
  const t = useTranslations("admin.funds.create-form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title")}
      description={t("description")}
      asButton={asButton}
      triggerLabel={isExternallyControlled ? undefined : t("trigger-label")}
    >
      <Form
        action={createFund}
        resolver={zodResolver(CreateFundSchema)}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          managementFeeBps: 100, // Default 1% management fee
        }}
        secureForm={true}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
