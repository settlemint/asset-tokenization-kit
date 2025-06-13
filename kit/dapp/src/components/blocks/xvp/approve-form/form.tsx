"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { approveXvp } from "@/lib/mutations/xvp/approve/approve-action";
import { ApproveXvpSchema } from "@/lib/mutations/xvp/approve/approve-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface ApproveFormProps {
  xvp: Address;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
  asTableAction?: boolean;
}

export function ApproveForm({
  xvp,
  open,
  onOpenChange,
  asButton = false,
  asTableAction = false,
}: ApproveFormProps) {
  const t = useTranslations("trade-management.xvp");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      asButton={asButton}
      asTableAction={asTableAction}
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t("approve")}
      title={t("approve-xvp-settlement")}
      description={t("approve-xvp-settlement-description")}
    >
      <Form
        action={approveXvp}
        resolver={typeboxResolver(ApproveXvpSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("approve"),
        }}
        defaultValues={{
          xvp,
          approved: false,
        }}
      >
        <Summary xvp={xvp} />
      </Form>
    </FormSheet>
  );
}
