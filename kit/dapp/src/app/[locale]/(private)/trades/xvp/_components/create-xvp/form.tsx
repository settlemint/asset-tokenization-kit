"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createXvp } from "@/lib/mutations/xvp/create/create-action";
import { CreateXvpSchema } from "@/lib/mutations/xvp/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AssetFlows } from "./steps/asset-flows";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";

interface CreateXvPFormProps {
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function CreateXvPForm({
  open,
  onOpenChange,
  disabled = false,
  asButton = false,
}: CreateXvPFormProps) {
  const t = useTranslations("trade-management.forms");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t("button.xvp")}
      title={t("title.xvp")}
      description={t("description.xvp")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={createXvp}
        resolver={typeboxResolver(CreateXvpSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("button.xvp"),
        }}
        defaultValues={{
          autoExecute: true,
        }}
      >
        <AssetFlows />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
