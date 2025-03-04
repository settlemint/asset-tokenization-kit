"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateStablecoinFormProps {
  open?: boolean;
  onCloseAction?: () => void;
  asButton?: boolean;
}

export function CreateStablecoinForm({
  open,
  onCloseAction,
  asButton = false,
}: CreateStablecoinFormProps) {
  const t = useTranslations("admin.stablecoins.create-form");
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open || localOpen}
      onOpenChange={(open) => {
        onCloseAction?.();
        setLocalOpen(open);
      }}
      title={t("title")}
      description={t("description")}
      asButton={asButton}
      triggerLabel={t("trigger-label")}
    >
      <Form
        action={createStablecoin}
        resolver={zodResolver(CreateStablecoinSchema)}
        onOpenChange={onCloseAction}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          collateralLivenessSeconds: 3600 * 24 * 365,
        }}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
