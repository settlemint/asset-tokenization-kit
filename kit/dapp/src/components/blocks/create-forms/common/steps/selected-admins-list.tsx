"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

export type AdminRole = "admin" | "user-manager" | "issuer";

export interface TokenAdmin {
  wallet: string;
  roles: AdminRole[];
}

interface SelectedAdminsListProps {
  admins: TokenAdmin[];
  onRemove: (wallet: string) => void;
  onChangeRoles: (wallet: string, roles: AdminRole[]) => void;
  onAddAnother: () => void;
}

export function SelectedAdminsList({
  admins,
  onRemove,
  onChangeRoles,
  onAddAnother
}: SelectedAdminsListProps) {
  const t = useTranslations("private.assets.create.form.steps.token-admins");

  return (
    <div className="space-y-3">
      {admins.map((admin) => (
        <div key={admin.wallet} className="flex items-center justify-between rounded-md border p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <EvmAddress address={admin.wallet as Address} />
          </div>

          <div className="flex items-center gap-2">
            {/* Role badges */}
            <div className="flex gap-1">
              {["admin", "user-manager", "issuer"].map((role) => (
                <Tooltip key={role}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={admin.roles.includes(role as AdminRole) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newRoles = admin.roles.includes(role as AdminRole)
                          ? admin.roles.filter(r => r !== role)
                          : [...admin.roles, role as AdminRole];
                        onChangeRoles(admin.wallet, newRoles);
                      }}
                    >
                      {t(`roles.${role}`)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {admin.roles.includes(role as AdminRole)
                      ? t("remove-role")
                      : t("add-role")}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(admin.wallet)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        className="w-full"
        onClick={onAddAnother}
      >
        <Plus className="mr-2 size-4" />
        {t("add-another-admin")}
      </Button>
    </div>
  );
}