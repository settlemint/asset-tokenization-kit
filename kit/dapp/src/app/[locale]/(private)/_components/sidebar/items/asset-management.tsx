import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { AssetTypeIcon } from "@/components/blocks/asset-type-icon/asset-type-icon";
import { type NavItem, NavMain } from "@/components/layout/nav-main";
import { ActivityIcon } from "@/components/ui/activity";
import { ChartScatterIcon } from "@/components/ui/chart-scatter";
import { MailCheckIcon } from "@/components/ui/mail-check";
import { getSidebarAssets } from "@/lib/queries/sidebar-assets/sidebar-assets";
import { EllipsisIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function AssetManagement() {
  const t = await getTranslations("admin.sidebar.asset-management");
  const data = await getSidebarAssets();

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

  const processedAssetItems = assetItems.reduce((acc, section) => {
    if (!section.assetType) {
      return acc;
    }

    const assetType = section.assetType;
    const assetsOfSection = data[assetType];

    const subItems = assetsOfSection.records.map((asset) => ({
      id: asset.id,
      label: asset.name,
      badge: asset.symbol ?? asset.id,
      path: `${section.path}/${asset.id}`,
      icon: <AddressAvatar address={asset.id} size="tiny" />,
    }));

    // Create a predictable object structure to ensure consistent rendering between server and client
    const sectionItem: NavItem = {
      ...section,
      label: section.label,
      path: section.path,
      badge: assetsOfSection.count.toString(),
    };

    // Only add subItems if there are any to prevent different rendering conditions
    if (subItems.length > 0) {
      sectionItem.subItems = [...subItems];

      // Add the "View all" item only if there are assets
      if (assetsOfSection.count > 0) {
        sectionItem.subItems.push({
          id: "view-all",
          label: t("view-all"),
          path: section.path,
          icon: (
            <EllipsisIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
          ),
        });
      }
    }

    acc.push(sectionItem);
    return acc;
  }, [] as NavItem[]);

  return (
    <NavMain
      items={[
        {
          label: t("dashboard"),
          icon: (
            <ChartScatterIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
          ),
          path: "/assets",
        },
        {
          label: t("actions"),
          icon: (
            <MailCheckIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
          ),
          path: "/assets/actions/pending",
        },
        {
          label: t("asset-activity"),
          icon: (
            <ActivityIcon className="size-4 cursor-pointer select-none rounded-md transition-colors duration-200 flex items-center justify-center" />
          ),
          path: "/assets/activity",
        },
        {
          groupTitle: t("group-title"),
          items: [...processedAssetItems],
        },
      ]}
    />
  );
}
