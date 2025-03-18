import { NavMain } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/animated-icons/activity";
import { ChartScatterIcon } from "@/components/ui/animated-icons/chart-scatter";
import { ConnectIcon } from "@/components/ui/animated-icons/connect";
import { SettingsGearIcon } from "@/components/ui/animated-icons/settings-gear";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { WalletIcon } from "@/components/ui/animated-icons/wallet";
import { getTranslations } from "next-intl/server";

export async function PortfolioManagement() {
  const t = await getTranslations("admin.sidebar.portfolio-management");

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("dashboard"),
              icon: <ChartScatterIcon className="size-4" />,
              path: "/portfolio",
            },
            {
              label: t("my-assets"),
              icon: <WalletIcon className="size-4" />,
              path: "/portfolio/my-assets",
            },
            {
              label: t("my-activity"),
              icon: <ActivityIcon className="size-4" />,
              path: "/portfolio/my-activity",
            },
            {
              label: t("my-contacts"),
              icon: <UsersIcon className="size-4" />,
              path: "/portfolio/my-contacts",
            },
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
              ],
            },
          ],
        },
      ]}
    />
  );
}
