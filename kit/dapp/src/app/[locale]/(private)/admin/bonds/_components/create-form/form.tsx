"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createBond } from "@/lib/mutations/bond/create/create-action";
import { CreateBondSchema } from "@/lib/mutations/bond/create/create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Basics } from "./steps/basics";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateBondFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateBondForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateBondFormProps) {
  const t = useTranslations("admin.bonds.create-form");
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
        action={createBond}
        resolver={zodResolver(CreateBondSchema)}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
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
