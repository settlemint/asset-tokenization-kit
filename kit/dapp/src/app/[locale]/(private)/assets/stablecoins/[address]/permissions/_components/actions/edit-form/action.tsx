"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditPermissionsForm, type EditPermissionsFormProps } from "./form";

export function EditPermissionsAction({
  address,
  account,
  currentRoles,
}: EditPermissionsFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin.stablecoins.permissions.edit-form");
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
      <EditPermissionsForm
        open={open}
        setOpen={setOpen}
        address={address}
        account={account}
        currentRoles={currentRoles}
      />
    </>
  );
}
