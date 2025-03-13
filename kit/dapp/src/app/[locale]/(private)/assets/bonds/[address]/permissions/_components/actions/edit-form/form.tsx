"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { Role } from "@/lib/config/roles";
import { updateRoles } from "@/lib/mutations/bond/update-roles/update-roles-action";
import { UpdateRolesSchema } from "@/lib/mutations/bond/update-roles/update-roles-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Roles } from "./steps/roles";
import { Summary } from "./steps/summary";

interface EditPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPermissionsForm({
  address,
  account,
  currentRoles,
  open,
  onOpenChange,
}: EditPermissionsFormProps) {
  const t = useTranslations("admin.asset-permissions-tab.edit-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("trigger-label")}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={updateRoles}
        resolver={zodResolver(UpdateRolesSchema)}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          userAddress: account,
        }}
      >
        <Roles />
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
