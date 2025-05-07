import { NavMain } from "@/components/layout/nav-main";
import { ConnectIcon } from "@/components/ui/connect";
import { SettingsGearIcon } from "@/components/ui/settings-gear";
import { UsersIcon } from "@/components/ui/users";
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
              icon: (
                <UsersIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/platform/users",
            },
            {
              label: t("api"),
              icon: (
                <ConnectIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/platform/api",
            },
            {
              label: t("settings"),
              icon: (
                <SettingsGearIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/platform/settings",
            },
          ],
        },
      ]}
    />
  );
}
