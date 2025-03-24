"use client";

import { NavMain } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/animated-icons/activity";
import { ChartScatterIcon } from "@/components/ui/animated-icons/chart-scatter";
import { ConnectIcon } from "@/components/ui/animated-icons/connect";
import { SettingsGearIcon } from "@/components/ui/animated-icons/settings-gear";
import { UsersIcon } from "@/components/ui/animated-icons/users";
import { WalletIcon } from "@/components/ui/animated-icons/wallet";
import { Link, usePathname } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function PortfolioManagement() {
  const t = useTranslations("admin.sidebar.portfolio-management");
  const pathname = usePathname();
  const isSettingsView = pathname.startsWith("/portfolio/settings");

  const settingsItems = [
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
          path: "/portfolio/settings/platform",
        },
      ],
    },
  ];

  const regularItems = [
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
  ];

  const items = isSettingsView ? settingsItems : regularItems;

  return (
    <div className="flex flex-col">
      {isSettingsView ? (
        <Link
          href="/portfolio"
          className="mb-2 flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("group-title")}
        </Link>
      ) : null}
      <NavMain
        items={[
          {
            groupTitle: isSettingsView ? "" : t("group-title"),
            items: items,
          },
        ]}
      />
    </div>
  );
}
