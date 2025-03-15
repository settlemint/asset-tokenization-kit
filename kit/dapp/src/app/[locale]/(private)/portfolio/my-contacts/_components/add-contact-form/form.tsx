"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createStablecoin } from "@/lib/mutations/stablecoin/create/create-action";
import { CreateStablecoinSchema } from "@/lib/mutations/stablecoin/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Contact } from "./steps/contact";

export function AddContactForm({
  open,
  onCloseAction,
}: {
  open: boolean;
  balance: string;
  decimals: number;
  onCloseAction: () => void;
}) {
  const t = useTranslations("portfolio.add-contact-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onCloseAction}
      title={t("contact.title")}
      description={t("contact.description")}
    >
      <Form
        action={createStablecoin}
        resolver={zodResolver(CreateStablecoinSchema)}
        onOpenChange={onCloseAction}
        buttonLabels={{
          label: t("contact.title"),
        }}
        defaultValues={{
          collateralLivenessSeconds: 3600 * 24 * 365,
        }}
      >
        <Contact />
      </Form>
    </FormSheet>
  );
}
