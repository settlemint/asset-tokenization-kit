"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { grantRole } from "@/lib/mutations/asset/access-control/grant-role/grant-role-action";
import { GrantRoleSchema } from "@/lib/mutations/asset/access-control/grant-role/grant-role-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { AdminAddress } from "./steps/address";
import { AdminRoles } from "./steps/roles";
import { Summary } from "./steps/summary";

interface GrantRoleFormProps {
  address: Address;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assettype: AssetType;
}

export function GrantRoleForm({
  address,
  open,
  onOpenChange,
  assettype,
}: GrantRoleFormProps) {
  const t = useTranslations("private.assets.details.forms.form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("title.grant-role")}
      description={t("description.grant-role")}
    >
      <Form
        action={grantRole}
        resolver={typeboxResolver(GrantRoleSchema())}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("trigger-label.grant-role"),
        }}
        defaultValues={{
          address,
          assettype,
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
