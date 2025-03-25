"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createFund } from "@/lib/mutations/fund/create/create-action";
import { CreateFundSchema } from "@/lib/mutations/fund/create/create-schema";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateFundFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
  userDetails: User;
}

export function CreateFundForm({
  open,
  onOpenChange,
  asButton = false,
  userDetails,
}: CreateFundFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.funds")}
      description={t("description.funds")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.funds")
      }
    >
      <Form
        action={createFund}
        resolver={typeboxResolver(CreateFundSchema())}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.funds"),
        }}
        defaultValues={{
          managementFeeBps: 100, // Default 1% management fee
          price: {
            amount: 1,
            currency: userDetails.currency,
          },
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
