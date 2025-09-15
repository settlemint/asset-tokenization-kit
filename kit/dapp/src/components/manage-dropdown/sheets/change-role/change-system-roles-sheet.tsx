import {
  ChangeRolesSheet,
  type ChangeRolesSheetProps,
} from "@/components/manage-dropdown/sheets/change-role/change-roles-sheet";
import { orpc } from "@/orpc/orpc-client";
import type { AccessControl } from "@atk/zod/access-control-roles";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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

  return (
    <ChangeRolesSheet
      open={open}
      onOpenChange={onOpenChange}
      accessControl={accessControl}
      presetAccount={presetAccount}
      revokeRole={onRevokeRole}
      grantRole={onGrantRole}
    />
  );
}
