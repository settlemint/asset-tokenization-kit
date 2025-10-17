import {
  ChangeRolesSheet,
  deriveAssignableRoles,
  mergeRoles,
  type ChangeRolesSheetProps,
  type RoleInfo,
} from "@/components/manage-dropdown/sheets/change-role/change-roles-sheet";
import { orpc } from "@/orpc/orpc-client";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { AccessControlRoles } from "@atk/zod/access-control-roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

type ChangeSystemRolesSheetProps = Pick<
  ChangeRolesSheetProps,
  "open" | "onOpenChange" | "presetAccount"
> & {
  accessControl: ChangeRolesSheetProps["accessControl"];
};

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
  const systemAssignableRoles = useMemo(
    () => deriveAssignableRoles(SYSTEM_PERMISSIONS),
    []
  );

  const rolesSet = useMemo(
    () => mergeRoles(systemAssignableRoles, accessControl),
    [accessControl, systemAssignableRoles]
  );

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
