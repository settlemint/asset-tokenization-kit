"use client";

import { AddAdminForm } from "@/app/[locale]/(private)/platform/admins/_components/add-admin-form/form";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function AdminsActions() {
  const t = useTranslations("admin.platform.settings");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t("add-admin-button")}</Button>
      <AddAdminForm open={isOpen} onCloseAction={() => setIsOpen(false)} />
    </>
  );
}
