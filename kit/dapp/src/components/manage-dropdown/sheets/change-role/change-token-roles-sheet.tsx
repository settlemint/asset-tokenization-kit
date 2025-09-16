import {
  ChangeRolesSheet,
  type ChangeRolesSheetProps,
} from "@/components/manage-dropdown/sheets/change-role/change-roles-sheet";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { AccessControlRoles } from "@atk/zod/access-control-roles";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import {
  RoleRequirement,
  isAllRoleRequirement,
  isAnyRoleRequirement,
  isSingleRole,
} from "@atk/zod/role-requirement";
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
  const { t } = useTranslation(["tokens"]);
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
        role: roles,
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
        roles,
      });
    },
    [grantRole, asset.id]
  );

  // Derive token-assignable roles from TOKEN_PERMISSIONS role requirements
  const tokenAssignableRoles = useMemo(() => {
    const set = new Set<AccessControlRoles>();
    const collect = (req: RoleRequirement) => {
      if (!req) return;
      if (isSingleRole(req)) {
        set.add(req);
        return;
      }
      if (isAnyRoleRequirement(req)) {
        for (const r of req.any) collect(r);
        return;
      }
      if (isAllRoleRequirement(req)) {
        for (const r of req.all) collect(r);
        return;
      }
    };
    Object.values(TOKEN_PERMISSIONS).forEach((req) => {
      collect(req);
    });
    return [...set.values()];
  }, []);

  const rolesSet = useMemo(() => {
    if (!asset.accessControl) {
      return tokenAssignableRoles;
    }
    const rolesFromAccessControl = asset.accessControl
      ? (Object.keys(asset.accessControl).filter((field) => {
          const value = asset.accessControl?.[field as AccessControlRoles];
          return Array.isArray(value) && value.length > 0;
        }) as AccessControlRoles[])
      : [];
    return [...new Set([...tokenAssignableRoles, ...rolesFromAccessControl])];
  }, [asset.accessControl, tokenAssignableRoles]);

  const groupedRoles = useMemo(() => {
    const groupForRole = (role: AccessControlRoles) => {
      if (role === "admin" || role === "tokenManager") return "Administration";
      if (role === "governance") return "Compliance";
      if (
        role === "supplyManagement" ||
        role === "emergency" ||
        role === "custodian"
      )
        return "Operations";
      return "Other";
    };

    const map = new Map<
      string,
      { label: string; roles: AccessControlRoles[] }
    >();
    rolesSet.forEach((r) => {
      const g = groupForRole(r);
      const group = map.get(g) ?? {
        roles: [],
        label: t(
          `tokens:permissions.groups.${g.toLowerCase() as Lowercase<typeof g>}` as const
        ),
      };
      group.roles.push(r);
      map.set(g, group);
    });
    return map;
  }, [rolesSet, t]);

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
