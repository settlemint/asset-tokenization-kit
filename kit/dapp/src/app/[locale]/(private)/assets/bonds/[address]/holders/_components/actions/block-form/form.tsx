"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { blockUser } from "@/lib/mutations/bond/block-user/block-user-action";
import { BlockUserSchema } from "@/lib/mutations/bond/block-user/block-user-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface BlockFormProps {
  address: Address;
  account: Address;
  isBlocked: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockForm({
  address,
  account,
  isBlocked,
  open,
  onOpenChange,
}: BlockFormProps) {
  const t = useTranslations("admin.asset-holders-tab.block-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
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
        buttonLabels={{
          label: isBlocked
            ? t("unblock-button-label")
            : t("block-button-label"),
        }}
        defaultValues={{
          address,
          account,
        }}
        secureForm={true}
      >
        <Summary address={address} isCurrentlyBlocked={isBlocked} />
      </Form>
    </FormSheet>
  );
}
