"use client";

import { Button } from "@/components/ui/button";
import type { User } from "@/lib/queries/user/user-schema";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdminRole } from "./admin-roles-badges";
import { SelectedAdminListItem } from "./selected-admin-list-item";

export interface TokenAdmin {
  wallet: string;
  roles: AdminRole[];
}

interface SelectedAdminsListProps {
  admins: TokenAdmin[];
  onRemove: (wallet: string) => void;
  onChangeRoles: (wallet: string, roles: AdminRole[]) => void;
  onAddAnother: () => void;
  userDetails: User;
}

export function SelectedAdminsList({
  admins,
  onRemove,
  onChangeRoles,
  onAddAnother,
  userDetails
}: SelectedAdminsListProps) {
  const t = useTranslations("private.assets.create.form.steps.token-admins");

  return (
    <div className="space-y-3">
      {/* Always show current user as admin, they will by default be added as a token admin */}
      <SelectedAdminListItem
        key={userDetails.wallet}
        admin={{
          wallet: userDetails.wallet,
          roles: ["admin", "user-manager", "issuer"]
        }}
      />
      {/* Show all other admins */}
      {admins.map((admin) => (
        <SelectedAdminListItem
          key={admin.wallet}
          admin={admin}
          onRemove={admin.wallet !== userDetails.wallet ? onRemove : undefined}
          onChangeRoles={onChangeRoles}
        />
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