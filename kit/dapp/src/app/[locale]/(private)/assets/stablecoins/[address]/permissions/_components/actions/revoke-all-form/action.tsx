"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  RevokeAllPermissionsForm,
  type RevokeAllPermissionsFormProps,
} from "./form";

export function RevokeAllPermissionsAction({
  address,
  account,
  currentRoles,
}: RevokeAllPermissionsFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin.stablecoins.permissions.revoke-all-form");

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        {t("button-label")}
      </DropdownMenuItem>
      <RevokeAllPermissionsForm
        open={open}
        setOpen={setOpen}
        address={address}
        account={account}
        currentRoles={currentRoles}
      />
    </>
  );
}
