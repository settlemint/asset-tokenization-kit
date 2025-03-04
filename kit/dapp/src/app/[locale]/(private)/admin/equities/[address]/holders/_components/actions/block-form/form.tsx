"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { blockUser } from "@/lib/mutations/equity/block-user/block-user-action";
import { BlockUserSchema } from "@/lib/mutations/equity/block-user/block-user-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface BlockFormProps {
  address: Address;
  account: Address;
  isBlocked: boolean;
}

export function BlockForm({ address, account, isBlocked }: BlockFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin.equities.holders.block-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={
        isBlocked ? t("unblock-trigger-label") : t("block-trigger-label")
      }
      title={isBlocked ? t("unblock-title") : t("block-title")}
      description={
        isBlocked ? t("unblock-description") : t("block-description")
      }
    >
      <Form
        action={blockUser}
        resolver={zodResolver(BlockUserSchema)}
        onOpenChange={setOpen}
        buttonLabels={{
          label: isBlocked
            ? t("unblock-button-label")
            : t("block-button-label"),
        }}
        defaultValues={{
          address,
          account,
        }}
      >
        <Summary address={address} isCurrentlyBlocked={isBlocked} />
      </Form>
    </FormSheet>
  );
}
