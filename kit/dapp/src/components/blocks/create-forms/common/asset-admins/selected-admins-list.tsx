"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "viem";
import { authClient } from "../../../../../lib/auth/client";
import type { AdminRole } from "./admin-roles-badges";
import { SelectedAdminListItem } from "./selected-admin-list-item";

export interface AssetAdmin {
  wallet: string;
  roles: AdminRole[];
}

interface SelectedAdminsListProps {
  admins: AssetAdmin[];
  onRemove: (wallet: string) => void;
  onChangeRoles: (wallet: string, roles: AdminRole[]) => void;
  onAddAnother: () => void;
}

export function SelectedAdminsList({
  admins,
  onRemove,
  onChangeRoles,
  onAddAnother,
}: SelectedAdminsListProps) {
  const { data: session } = authClient.useSession();
  const t = useTranslations("private.assets.create.form.steps.asset-admins");
  const wallet = session?.user.wallet as Address;
  return (
    <div className="space-y-3">
      {/* Always show current user as admin, they will by default be added as a token admin */}
      <SelectedAdminListItem
        key={session?.user.wallet as Address}
        admin={{
          wallet,
          roles: ["admin", "user-manager", "issuer"],
        }}
      />
      {/* Show all other admins */}
      {admins.map((admin) => (
        <SelectedAdminListItem
          key={admin.wallet}
          admin={admin}
          onRemove={admin.wallet !== wallet ? onRemove : undefined}
          onChangeRoles={onChangeRoles}
        />
      ))}

      <Button
        type="button"
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
