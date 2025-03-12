"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { grantRole } from "@/lib/mutations/bond/grant-role/grant-role-action";
import { GrantRoleSchema } from "@/lib/mutations/bond/grant-role/grant-role-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { AdminAddress } from "./steps/address";
import { AdminRoles } from "./steps/roles";
import { Summary } from "./steps/summary";

interface GrantRoleFormProps {
  address: Address;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GrantRoleForm({
  address,
  open,
  onOpenChange,
}: GrantRoleFormProps) {
  const t = useTranslations("admin.bonds.grant-role-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={grantRole}
        resolver={zodResolver(GrantRoleSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          roles: {
            DEFAULT_ADMIN_ROLE: false,
            SUPPLY_MANAGEMENT_ROLE: false,
            USER_MANAGEMENT_ROLE: false,
          },
        }}
        secureForm={true}
      >
        <AdminAddress />
        <AdminRoles />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
