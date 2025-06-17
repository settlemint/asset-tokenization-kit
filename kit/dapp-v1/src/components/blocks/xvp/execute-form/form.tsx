"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { executeXvp } from "@/lib/mutations/xvp/execute/execute-action";
import { ExecuteXvpSchema } from "@/lib/mutations/xvp/execute/execute-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface ExecuteFormProps {
  xvp: Address;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function ExecuteForm({
  xvp,
  open,
  onOpenChange,
  asButton = false,
}: ExecuteFormProps) {
  const t = useTranslations("trade-management.xvp");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      asButton={asButton}
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t("execute")}
      title={t("execute-xvp-settlement")}
      description={t("execute-xvp-settlement-description")}
    >
      <Form
        action={executeXvp}
        resolver={typeboxResolver(ExecuteXvpSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("execute"),
        }}
        defaultValues={{
          xvp,
        }}
      >
        <Summary xvp={xvp} />
      </Form>
    </FormSheet>
  );
}
