"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { useUserCurrency } from "@/hooks/use-user-currency";
import { createEquity } from "@/lib/mutations/equity/create/create-action";
import { CreateEquitySchema } from "@/lib/mutations/equity/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateEquityFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateEquityForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateEquityFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const { userCurrency } = useUserCurrency();

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.equities")}
      description={t("description.equities")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.equities")
      }
    >
      <Form
        action={createEquity}
        resolver={typeboxResolver(CreateEquitySchema())}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.equities"),
        }}
        defaultValues={{
          price: {
            amount: 1,
            currency: userCurrency,
          },
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
      >
        <Basics />
        <Configuration userCurrency={userCurrency} />
        <Summary />
      </Form>
    </FormSheet>
  );
}
