import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { type Role, ROLES } from "@/lib/config/roles";
import { updateRoles } from "@/lib/mutations/asset/access-control/update-role/update-role-action";
import { UpdateRolesSchema } from "@/lib/mutations/asset/access-control/update-role/update-role-schema";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { EvmAddress } from "../evm-address/evm-address";
import { Roles } from "./steps/roles";
import { Summary } from "./steps/summary";

export interface EditPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
  disableEditAdminRole: boolean;
  assetName: string;
  assettype: AssetType;
}

interface EditPermissionsFormPropsWithOpen extends EditPermissionsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPermissionsForm({
  address,
  account,
  currentRoles,
  disableEditAdminRole,
  assetName,
  open,
  onOpenChange,
  assettype,
}: EditPermissionsFormPropsWithOpen) {
  const t = useTranslations("private.assets.details.permissions.edit-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("trigger-label")}
      title={<EvmAddress address={account} />}
      description={t("description", { name: assetName })}
    >
      <Form
        action={updateRoles}
        resolver={typeboxResolver(UpdateRolesSchema())}
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
        <Roles disableEditAdminRole={disableEditAdminRole} />
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
