"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { grantRole } from "@/lib/mutations/cryptocurrency/grant-role/grant-role-action";
import { GrantRoleSchema } from "@/lib/mutations/cryptocurrency/grant-role/grant-role-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Address } from "viem";
import { AdminAddress } from "./steps/address";
import { AdminRoles } from "./steps/roles";
import { Summary } from "./steps/summary";

interface GrantRoleFormProps {
  address: Address;
}

export function GrantRoleForm({ address }: GrantRoleFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin.cryptocurrencies.grant-role-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t("trigger-label")}
      title={t("title")}
      description={t("description")}
    >
      <Form
        action={grantRole}
        resolver={zodResolver(GrantRoleSchema)}
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
      >
        <AdminAddress />
        <AdminRoles />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
