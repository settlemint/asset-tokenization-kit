import { NavMain } from "@/components/layout/nav-main";
import { ConnectIcon } from "@/components/ui/animated-icons/connect";
import { SettingsGearIcon } from "@/components/ui/animated-icons/settings-gear";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { getTranslations } from "next-intl/server";

export async function PlatformManagement() {
  const t = await getTranslations("admin.sidebar.platform-management");

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("user-management"),
              icon: <UsersIcon className="size-4" />,
              path: "/platform/users",
            },
            {
              label: t("api"),
              icon: <ConnectIcon className="size-4" />,
              path: "/platform/api",
            },
            {
              label: t("settings"),
              icon: <SettingsGearIcon className="size-4" />,
              path: "/platform/settings",
            },
          ],
        },
      ]}
    />
  );
}
