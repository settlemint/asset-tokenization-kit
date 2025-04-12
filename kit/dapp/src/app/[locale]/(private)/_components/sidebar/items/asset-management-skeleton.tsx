import { AssetTypeIcon } from "@/components/blocks/asset-type-icon/asset-type-icon";
import { type NavItem, NavMain } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/animated-icons/activity";
import { ChartScatterIcon } from "@/components/ui/animated-icons/chart-scatter";
import { getTranslations } from "next-intl/server";

export async function AssetManagementSkeleton() {
  const t = await getTranslations("admin.sidebar.asset-management");

  // Asset configuration defined inline
  const assetItems: NavItem[] = [
    {
      assetType: "bond",
      label: t("bonds"),
      path: "/assets/bond",
      icon: <AssetTypeIcon type="bond" />,
    },
    {
      assetType: "cryptocurrency",
      label: t("cryptocurrencies"),
      path: "/assets/cryptocurrency",
      icon: <AssetTypeIcon type="cryptocurrency" />,
    },
    {
      assetType: "equity",
      label: t("equities"),
      path: "/assets/equity",
      icon: <AssetTypeIcon type="equity" />,
    },
    {
      assetType: "fund",
      label: t("funds"),
      path: "/assets/fund",
      icon: <AssetTypeIcon type="fund" />,
    },
    {
      assetType: "stablecoin",
      label: t("stablecoins"),
      path: "/assets/stablecoin",
      icon: <AssetTypeIcon type="stablecoin" />,
    },
    {
      assetType: "deposit",
      label: t("tokenized-deposits"),
      path: "/assets/deposit",
      icon: <AssetTypeIcon type="deposit" />,
    },
  ];

  return (
    <NavMain
      items={[
        {
          groupTitle: t("group-title"),
          items: [
            {
              label: t("dashboard"),
              icon: <ChartScatterIcon className="size-4" />,
              path: "/assets",
            },
            ...assetItems,
            {
              label: t("asset-activity"),
              icon: <ActivityIcon className="size-4" />,
              path: "/assets/activity",
            },
          ],
        },
      ]}
    />
  );
}
