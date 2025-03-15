"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createTokenizedDeposit } from "@/lib/mutations/tokenized-deposit/create/create-action";
import { CreateTokenizedDepositSchema } from "@/lib/mutations/tokenized-deposit/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Summary } from "./steps/summary";

interface CreateTokenizedDepositFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateTokenizedDepositForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateTokenizedDepositFormProps) {
  const t = useTranslations("admin.tokenized-deposits.create-form");
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
        action={createTokenizedDeposit}
        resolver={zodResolver(CreateTokenizedDepositSchema)}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("button-label"),
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(["predictedAddress"]);
        }}
      >
        <Basics />
        <Summary />
      </Form>
    </FormSheet>
  );
}
