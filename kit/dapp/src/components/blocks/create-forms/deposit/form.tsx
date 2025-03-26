"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createDeposit } from "@/lib/mutations/deposit/create/create-action";
import { CreateDepositSchema } from "@/lib/mutations/deposit/create/create-schema";
import type { User } from "@/lib/queries/user/user-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";
interface CreateDepositFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
  userDetails: User;
}

export function CreateDepositForm({
  open,
  onOpenChange,
  asButton = false,
  userDetails,
}: CreateDepositFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.deposits")}
      description={t("description.deposits")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.deposits")
      }
    >
      <Form
        action={createDeposit}
        resolver={typeboxResolver(CreateDepositSchema())}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.deposits"),
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
        defaultValues={{
          collateralLivenessValue: 12,
          collateralLivenessTimeUnit: "months",
          price: {
            amount: 1,
            currency: userDetails.currency,
          },
        }}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
