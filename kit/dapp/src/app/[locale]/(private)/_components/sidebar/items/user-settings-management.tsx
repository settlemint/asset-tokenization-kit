"use client";

import { NavMain } from "@/components/layout/nav-main";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { useTranslations } from "next-intl";

export function UserSettingsManagement() {
  const t = useTranslations("admin.sidebar.settings-management");

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("profile"),
              icon: <UsersIcon className="size-4" />,
              path: "/portfolio/settings/profile",
            },
          ],
        },
      ]}
    />
  );
}
