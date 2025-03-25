"use client";

import { NavMain } from "@/components/layout/nav-main";
import { ConnectIcon } from "@/components/ui/animated-icons/connect";
import { SettingsGearIcon } from "@/components/ui/animated-icons/settings-gear";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";

export function SettingsManagement() {
  const t = useTranslations("admin.sidebar.settings-management");
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";

  const subItems = [
    {
      label: t("profile"),
      icon: <UsersIcon className="size-4" />,
      path: "/portfolio/settings/profile",
    },
    {
      label: t("api"),
      icon: <ConnectIcon className="size-4" />,
      path: "/portfolio/settings/api",
    },
  ];

  if (isAdmin) {
    subItems.push({
      label: t("platform"),
      icon: <SettingsGearIcon className="size-4" />,
      path: "/platform/settings",
    });
  }

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("settings"),
              icon: <SettingsGearIcon className="size-4" />,
              path: "/settings",
              subItems,
            },
          ],
        },
      ]}
    />
  );
}
