"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { useSettings } from "@/hooks/use-settings";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateStablecoinFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateStablecoinForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateStablecoinFormProps) {
  const t = useTranslations("private.assets.create.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const baseCurrency = useSettings("baseCurrency");

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t("title.stablecoins")}
      description={t("description.stablecoins")}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.stablecoins")
      }
    >
      <Form
        action={createStablecoin}
        resolver={typeboxResolver(CreateStablecoinSchema())}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t("trigger-label.stablecoins"),
        }}
        defaultValues={{
          collateralLivenessValue: 12,
          collateralLivenessTimeUnit: "months",
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
