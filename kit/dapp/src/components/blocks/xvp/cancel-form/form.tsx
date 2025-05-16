"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { cancelXvp } from "@/lib/mutations/xvp/cancel/cancel-action";
import { CancelXvpSchema } from "@/lib/mutations/xvp/cancel/cancel-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface CancelFormProps {
  xvp: Address;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CancelForm({
  xvp,
  open,
  onOpenChange,
  asButton = false,
}: CancelFormProps) {
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
      triggerLabel={isExternallyControlled ? undefined : t("cancel")}
      title={t("cancel-xvp-settlement")}
      description={t("cancel-xvp-settlement-description")}
    >
      <Form
        action={cancelXvp}
        resolver={typeboxResolver(CancelXvpSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("cancel"),
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
