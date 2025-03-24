"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { setYieldSchedule } from "@/lib/mutations/bond/set-yield-schedule/set-yield-schedule-action";
import { SetYieldScheduleSchema } from "@/lib/mutations/bond/set-yield-schedule/set-yield-schedule-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Schedule } from "./steps/schedule";
import { Summary } from "./steps/summary";

interface SetYieldScheduleFormProps {
  address: Address;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SetYieldScheduleForm({
  address,
  asButton = false,
  open,
  onOpenChange,
}: SetYieldScheduleFormProps) {
  const t = useTranslations("admin.bonds.yield.set-schedule");
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const locale = useLocale();

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t("trigger-label")}
      title={t("title")}
      description={t("description")}
      asButton={asButton}
    >
      <Form
        action={setYieldSchedule}
        resolver={zodResolver(SetYieldScheduleSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          locale,
        }}
      >
        <Schedule />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
