"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import type { Role } from "@/lib/config/roles";
import { UpdateRolesSchema } from "@/lib/mutations/asset/access-control/update-role/update-role-schema";
import type { UpdateRolesActionType } from "@/lib/mutations/asset/access-control/update-role/update-roles-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { EvmAddress } from "../evm-address/evm-address";
import { Roles } from "./steps/roles";
import { Summary } from "./steps/summary";

export interface EditPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
  adminsCount: number;
  assetName: string;
  updateRolesAction: UpdateRolesActionType;
}

interface EditPermissionsFormPropsWithOpen extends EditPermissionsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPermissionsForm({
  address,
  account,
  currentRoles,
  adminsCount,
  assetName,
  open,
  onOpenChange,
  updateRolesAction,
}: EditPermissionsFormPropsWithOpen) {
  const t = useTranslations("admin.asset-permissions-tab.edit-form");

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t("trigger-label")}
      title={<EvmAddress address={account} />}
      description={t("description", { name: assetName })}
    >
      <Form
        action={updateRolesAction}
        resolver={zodResolver(UpdateRolesSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t("button-label"),
        }}
        defaultValues={{
          address,
          userAddress: account,
          roles: currentRoles.reduce(
            (acc, role) => {
              acc[role] = true;
              return acc;
            },
            {} as Record<Role, boolean>
          ),
        }}
      >
        <Roles adminsCount={adminsCount} />
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
