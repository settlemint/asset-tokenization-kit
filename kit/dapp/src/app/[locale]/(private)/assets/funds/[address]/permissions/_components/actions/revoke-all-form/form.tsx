"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { Role } from "@/lib/config/roles";
import { revokeRole } from "@/lib/mutations/fund/revoke-role/revoke-role-action";
import { RevokeRoleSchema } from "@/lib/mutations/fund/revoke-role/revoke-role-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

interface RevokeAllPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevokeAllPermissionsForm({
  address,
  account,
  currentRoles,
  open,
  onOpenChange,
}: RevokeAllPermissionsFormProps) {
  const t = useTranslations("admin.asset-permissions-tab.revoke-all-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("trigger-label")}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={revokeRole}
        resolver={zodResolver(RevokeRoleSchema)}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          userAddress: account,
        }}
      >
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
