import {
  ChangeRolesSheet,
  type ChangeRolesSheetProps,
  type RoleInfo,
} from "@/components/manage-dropdown/sheets/change-role/change-roles-sheet";
import { orpc } from "@/orpc/orpc-client";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import {
  AccessControl,
  AccessControlRoles,
} from "@atk/zod/access-control-roles";
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

interface ChangeSystemRolesSheetProps {
  open: boolean;
  accessControl: AccessControl | undefined;
  onOpenChange: (open: boolean) => void;
  presetAccount?: EthereumAddress;
}

export function ChangeSystemRolesSheet({
  open,
  accessControl,
  onOpenChange,
  presetAccount,
}: ChangeSystemRolesSheetProps) {
  const { t } = useTranslation(["user", "common"]);
  const queryClient = useQueryClient();

  const { mutateAsync: grantRole } = useMutation(
    orpc.system.accessManager.grantRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  const { mutateAsync: revokeRole } = useMutation(
    orpc.system.accessManager.revokeRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );

  const onRevokeRole = useCallback<ChangeRolesSheetProps["revokeRole"]>(
    async ({ accountAddress, walletVerification, roles }) => {
      await revokeRole({
        address: accountAddress,
        walletVerification,
        role: roles,
      });
    },
    [revokeRole]
  );

  const onGrantRole = useCallback<ChangeRolesSheetProps["grantRole"]>(
    async ({ accountAddress, walletVerification, roles }) => {
      await grantRole({
        address: accountAddress,
        walletVerification,
        role: roles,
      });
    },
    [grantRole]
  );

  // Derive system-assignable roles from SYSTEM_PERMISSIONS role requirements
  const systemAssignableRoles = useMemo(() => {
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
    Object.values(SYSTEM_PERMISSIONS).forEach((req) => {
      collect(req);
    });
    return [...set.values()];
  }, []);

  const rolesSet = useMemo(() => {
    if (!accessControl) {
      return systemAssignableRoles;
    }
    const rolesFromAccessControl = Object.keys(accessControl).filter(
      (field) => {
        const value = accessControl[field as AccessControlRoles];
        return Array.isArray(value) && value.length > 0;
      }
    ) as AccessControlRoles[];
    return [...new Set([...systemAssignableRoles, ...rolesFromAccessControl])];
  }, [accessControl, systemAssignableRoles]);

  const groupedRoles = useMemo(() => {
    const groupForRole = (role: AccessControlRoles) => {
      // Group system roles logically based on their function in SYSTEM_PERMISSIONS
      if (
        role === "admin" ||
        role === "systemManager" ||
        role === "addonManager" ||
        role === "systemModule"
      ) {
        return "System-Administration";
      }
      if (role === "tokenManager") {
        return "Assets-Management";
      }
      if (role === "claimIssuer" || role === "identityManager") {
        return "Identity-Management";
      }
      if (role === "complianceManager" || role === "claimPolicyManager") {
        return "Compliance";
      }
      return "Other";
    };

    const map = new Map<string, { label: string; roles: RoleInfo[] }>();
    rolesSet.forEach((r) => {
      const g = groupForRole(r);
      const group = map.get(g) ?? {
        roles: [],
        label: t(
          `user:permissions.groups.${g.toLowerCase() as Lowercase<typeof g>}` as const
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
  }, [rolesSet, t]);

  return (
    <ChangeRolesSheet
      open={open}
      onOpenChange={onOpenChange}
      accessControl={accessControl}
      presetAccount={presetAccount}
      revokeRole={onRevokeRole}
      grantRole={onGrantRole}
      groupedRoles={groupedRoles}
    />
  );
}
