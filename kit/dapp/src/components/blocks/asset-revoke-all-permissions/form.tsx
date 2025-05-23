"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { type Role, ROLES } from "@/lib/config/roles";
import { revokeRole } from "@/lib/mutations/asset/access-control/revoke-role/revoke-role-action";
import { RevokeRoleSchema } from "@/lib/mutations/asset/access-control/revoke-role/revoke-role-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { Summary } from "./steps/summary";

export interface RevokeAllPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
  assettype: AssetType;
}

interface RevokeAllPermissionsFormPropsWithOpen
  extends RevokeAllPermissionsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevokeAllPermissionsForm({
  address,
  account,
  currentRoles,
  open,
  onOpenChange,
  assettype,
}: RevokeAllPermissionsFormPropsWithOpen) {
  const t = useTranslations(
    "private.assets.details.permissions.revoke-all-form"
  );

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
        resolver={typeboxResolver(RevokeRoleSchema())}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          userAddress: account,
          assettype,
          roles: {
            DEFAULT_ADMIN_ROLE: currentRoles.includes(
              ROLES.DEFAULT_ADMIN_ROLE.contractRole
            ),
            SUPPLY_MANAGEMENT_ROLE: currentRoles.includes(
              ROLES.SUPPLY_MANAGEMENT_ROLE.contractRole
            ),
            USER_MANAGEMENT_ROLE: currentRoles.includes(
              ROLES.USER_MANAGEMENT_ROLE.contractRole
            ),
            AUDITOR_ROLE: currentRoles.includes(
              ROLES.AUDITOR_ROLE.contractRole
            ),
          },
        }}
      >
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
