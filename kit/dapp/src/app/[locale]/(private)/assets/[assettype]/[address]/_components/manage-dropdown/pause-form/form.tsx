"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { pause } from "@/lib/mutations/pause/pause-action";
import { PauseSchema } from "@/lib/mutations/pause/pause-schema";
import { unpause } from "@/lib/mutations/unpause/unpause-action";
import { UnpauseSchema } from "@/lib/mutations/unpause/unpause-schema";
import type { AssetType } from "@/lib/utils/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface PauseFormProps {
  address: Address;
  assettype: AssetType;
  isPaused: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PauseForm({
  address,
  assettype,
  isPaused,
  open,
  onOpenChange,
}: PauseFormProps) {
  const t = useTranslations("private.assets.details.forms.form");

  if (isPaused) {
    return (
      <FormSheet
        open={open}
        onOpenChange={onOpenChange}
        title={t("title.unpause")}
        description={t("description.unpause")}
      >
        <Form
          action={unpause}
          resolver={zodResolver(UnpauseSchema)}
          onOpenChange={onOpenChange}
          buttonLabels={{
            label: t("trigger-label.unpause"),
          }}
          defaultValues={{
            address,
            assettype,
          }}
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
      title={t("title.pause")}
      description={t("description.pause")}
    >
      <Form
        action={pause}
        resolver={zodResolver(PauseSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("trigger-label.pause"),
        }}
        defaultValues={{
          address,
          assettype,
        }}
      >
        <Summary address={address} isCurrentlyPaused={isPaused} />
      </Form>
    </FormSheet>
  );
}
