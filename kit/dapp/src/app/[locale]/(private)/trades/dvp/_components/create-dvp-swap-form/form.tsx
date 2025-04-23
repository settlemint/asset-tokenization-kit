"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { authClient } from "@/lib/auth/client";
import { createDvpSwap } from "@/lib/mutations/dvp/create/create-action";
import { CreateDvpSwapSchema } from "@/lib/mutations/dvp/create/create-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Configuration } from "./steps/configuration";
import { Participants } from "./steps/participants";
import { Summary } from "./steps/summary";

interface CreateDvpSwapFormProps {
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function CreateDvpSwapForm({
  open,
  onOpenChange,
  disabled = false,
  asButton = false,
}: CreateDvpSwapFormProps) {
  const t = useTranslations("trade-management.forms");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const data = authClient.useSession();
  const user = data.data.user.wallet;

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t("button.dvp-swap")}
      title={t("title.dvp-swap")}
      description={t("description.dvp-swap")}
      asButton={asButton}
      disabled={disabled}
    >
      <Form
        action={createDvpSwap}
        resolver={typeboxResolver(CreateDvpSwapSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("button.dvp-swap"),
        }}
        defaultValues={{
          sender: user,
        }}
      >
        <Participants />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
