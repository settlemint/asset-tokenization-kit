"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { pause } from "@/lib/mutations/fund/pause/pause-action";
import { PauseSchema } from "@/lib/mutations/fund/pause/pause-schema";
import { unpause } from "@/lib/mutations/fund/unpause/unpause-action";
import { UnPauseSchema } from "@/lib/mutations/fund/unpause/unpause-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface PauseFormProps {
  address: Address;
  isPaused: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PauseForm({
  address,
  isPaused,
  open,
  onOpenChange,
}: PauseFormProps) {
  const t = useTranslations("admin.funds.pause-form");

  if (isPaused) {
    return (
      <FormSheet
        open={open}
        onOpenChange={onOpenChange}
        title={t("unpause.title")}
        description={t("unpause.description")}
      >
        <Form
          action={unpause}
          resolver={zodResolver(UnPauseSchema)}
          onOpenChange={onOpenChange}
          buttonLabels={{
            label: t("unpause.button-label"),
          }}
          defaultValues={{
            address,
          }}
          secureForm={true}
        >
          <Summary address={address} isCurrentlyPaused={isPaused} />
        </Form>
      </FormSheet>
    );
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("pause.title")}
      description={t("pause.description")}
    >
      <Form
        action={pause}
        resolver={zodResolver(PauseSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("pause.button-label"),
        }}
        defaultValues={{
          address,
        }}
        secureForm={true}
      >
        <Summary address={address} isCurrentlyPaused={isPaused} />
      </Form>
    </FormSheet>
  );
}
