import { NavMain } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/animated-icons/activity";
import { ChartScatterIcon } from "@/components/ui/animated-icons/chart-scatter";
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
          ],
        },
      ]}
    />
  );
}
