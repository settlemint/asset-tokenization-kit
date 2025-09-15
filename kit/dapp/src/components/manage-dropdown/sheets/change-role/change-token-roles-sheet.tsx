import {
  ChangeRolesSheet,
  type ChangeRolesSheetProps,
} from "@/components/manage-dropdown/sheets/change-role/change-roles-sheet";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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

  return (
    <ChangeRolesSheet
      open={open}
      onOpenChange={onOpenChange}
      asset={asset}
      accessControl={asset.accessControl}
      presetAccount={presetAccount}
      revokeRole={onRevokeRole}
      grantRole={onGrantRole}
    />
  );
}
