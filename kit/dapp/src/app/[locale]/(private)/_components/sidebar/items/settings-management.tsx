import { NavMain } from "@/components/layout/nav-main";
import { ConnectIcon } from "@/components/ui/animated-icons/connect";
import { SettingsGearIcon } from "@/components/ui/animated-icons/settings-gear";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { getTranslations } from "next-intl/server";

export async function SettingsManagement() {
  const t = await getTranslations("admin.sidebar.settings-management");

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("settings"),
              icon: <SettingsGearIcon className="size-4" />,
              path: "/portfolio/settings",
              subItems: [
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
                {
                  label: t("platform"),
                  icon: <SettingsGearIcon className="size-4" />,
                  path: "/platform/settings",
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}
