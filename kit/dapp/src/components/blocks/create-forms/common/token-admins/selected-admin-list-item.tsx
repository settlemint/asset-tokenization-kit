"use client";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Address } from "viem";
import { AdminRolesBadges, type AdminRole } from "./admin-roles-badges";
import type { TokenAdmin } from "./selected-admins-list";

interface SelectedAdminListItemProps {
  admin: TokenAdmin;
  onChangeRoles?: (wallet: string, roles: AdminRole[]) => void;
  onRemove?: (wallet: string) => void;
}

export function SelectedAdminListItem({
  admin,
  onRemove,
  onChangeRoles,
}: SelectedAdminListItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <EvmAddress address={admin.wallet as Address} />
      </div>

      <div className="flex items-center gap-2">
        <AdminRolesBadges
          roles={admin.roles}
          onChangeRoles={onChangeRoles ? (newRoles: AdminRole[]) => onChangeRoles(admin.wallet, newRoles) : undefined}
        />

        {onRemove ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(admin.wallet)}
          >
            <X className="size-4" />
          </Button>
        ) : (
          <div className="h-9 w-9" /> /* Same size as the button */
        )}
      </div>
    </div>
  );
}