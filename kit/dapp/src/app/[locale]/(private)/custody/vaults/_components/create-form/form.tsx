"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { createXvp } from "@/lib/mutations/xvp/create/create-action";
import { CreateXvpSchema } from "@/lib/mutations/xvp/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Amount } from "./steps/amount";
import { Configuration } from "./steps/configuration";
import { Summary } from "./steps/summary";
import { User } from "./steps/user";

interface CreateVaultFormProps {
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function CreateVaultForm({
  open,
  onOpenChange,
  disabled = false,
  asButton = false,
}: CreateVaultFormProps) {
  const t = useTranslations("custody.vaults.forms");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t("button.vault")}
      title={t("title.vault")}
      description={t("description.vault")}
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
          label: t("button.vault"),
        }}
        defaultValues={{
          autoExecute: true,
        }}
      >
        <User />
        <Amount />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
