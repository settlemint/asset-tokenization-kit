import {
  ChangeRolesSheet,
  ChangeRolesSheetProps,
  RoleInfo,
} from "@/components/manage-dropdown/sheets/change-role/change-roles-sheet";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import {
  AccessControlRoles,
  assetAccessControlRoles,
  type AssetAccessControlRoles,
} from "@atk/zod/access-control-roles";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ChangeTokenRolesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
  presetAccount?: EthereumAddress;
}

export function ChangeTokenRolesSheet({
  open,
  onOpenChange,
  asset,
  presetAccount,
}: ChangeTokenRolesSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();

  const { mutateAsync: grantRole } = useMutation(
    orpc.token.grantRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.token.read.queryKey({
            input: { tokenAddress: asset.id },
          }),
        });
      },
    })
  );
  const { mutateAsync: revokeRole } = useMutation(
    orpc.token.revokeRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.token.read.queryKey({
            input: { tokenAddress: asset.id },
          }),
        });
      },
    })
  );

  const onRevokeRole = useCallback<ChangeRolesSheetProps["revokeRole"]>(
    async ({ accountAddress, walletVerification, roles }) => {
      await revokeRole({
        contract: asset.id,
        address: accountAddress,
        walletVerification,
        role: roles as AssetAccessControlRoles[],
      });
    },
    [revokeRole, asset.id]
  );

  const onGrantRole = useCallback<ChangeRolesSheetProps["grantRole"]>(
    async ({ accountAddress, walletVerification, roles }) => {
      await grantRole({
        contract: asset.id,
        address: accountAddress,
        walletVerification,
        roles: roles as AssetAccessControlRoles[],
      });
    },
    [grantRole, asset.id]
  );

  const groupedRoles = useMemo(() => {
    const groupForRole = (role: AccessControlRoles) => {
      if (role === "admin") return "Administration";
      if (role === "governance") return "Compliance";
      if (
        role === "supplyManagement" ||
        role === "emergency" ||
        role === "custodian"
      )
        return "Operations";
      return "Other";
    };

    const map = new Map<string, { label: string; roles: RoleInfo[] }>();
    assetAccessControlRoles.forEach((r) => {
      const g = groupForRole(r);
      const group = map.get(g) ?? {
        roles: [],
        label: t(
          `tokens:permissions.groups.${g.toLowerCase() as Lowercase<typeof g>}` as const
        ),
      };
      const roleName = r.toLowerCase() as Lowercase<typeof r>;
      group.roles.push({
        role: r,
        label: t(`common:roles.${roleName}.title` as const),
        description: t(`common:roles.${roleName}.description` as const),
      });
      map.set(g, group);
    });
    return map;
  }, [t]);

  return (
    <ChangeRolesSheet
      open={open}
      onOpenChange={onOpenChange}
      asset={asset}
      accessControl={asset.accessControl}
      presetAccount={presetAccount}
      revokeRole={onRevokeRole}
      grantRole={onGrantRole}
      groupedRoles={groupedRoles}
    />
  );
}
