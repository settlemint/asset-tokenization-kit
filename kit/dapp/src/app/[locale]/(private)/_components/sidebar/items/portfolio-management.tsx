import { NavMain } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/activity";
import { ChartScatterIcon } from "@/components/ui/chart-scatter";
import { HandCoinsIcon } from "@/components/ui/hand-coins";
import { UsersIcon } from "@/components/ui/users";
import { getTranslations } from "next-intl/server";

export async function PortfolioManagement() {
  const t = await getTranslations("admin.sidebar.portfolio-management");

  return (
    <NavMain
      items={[
        {
          label: t("dashboard"),
          icon: (
            <ChartScatterIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
          ),
          path: "/portfolio",
        },
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("my-assets"),
              icon: (
                <HandCoinsIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/portfolio/my-assets",
            },
            {
              label: t("my-activity"),
              icon: (
                <ActivityIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/portfolio/my-activity",
            },
            {
              label: t("my-contacts"),
              icon: (
                <UsersIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
              ),
              path: "/portfolio/my-contacts",
            },
          ],
        },
      ]}
    />
  );
}
