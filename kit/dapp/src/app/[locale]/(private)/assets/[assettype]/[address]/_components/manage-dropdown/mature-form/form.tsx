"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { mature } from "@/lib/mutations/bond/mature/mature-action";
import { MatureFormSchema } from "@/lib/mutations/bond/mature/mature-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface MatureFormProps {
  address: Address;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MatureForm({
  address,
  asButton = false,
  open,
  onOpenChange,
}: MatureFormProps) {
  const t = useTranslations("private.assets.details.forms.form");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={
        isExternallyControlled ? undefined : t("trigger-label.mature")
      }
      title={t("title.mature")}
      description={t("description.mature")}
      asButton={asButton}
    >
      <Form
        action={mature}
        resolver={zodResolver(MatureFormSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("trigger-label.mature"),
        }}
        defaultValues={{
          address,
        }}
      >
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
