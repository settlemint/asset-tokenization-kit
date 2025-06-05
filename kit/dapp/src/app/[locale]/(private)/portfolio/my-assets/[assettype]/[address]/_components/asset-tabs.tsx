import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { isMicaEnabledForAsset } from "@/lib/utils/features-enabled";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface AssetTabsProps {
  locale: Locale;
  address: Address;
  assettype: AssetType;
}

const tabs = async ({
  locale,
  address,
  assettype,
}: AssetTabsProps): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: "private.assets.details",
  });

  let isMicaEnabled = false;
  try {
    isMicaEnabled = await isMicaEnabledForAsset(assettype, address);
  } catch (error) {
    console.error("Failed to check MICA status:", error);
  }

  const tabItems = [
    {
      name: t("tabs.details"),
      href: `/portfolio/my-assets/${assettype}/${address}`,
    },
    ...(isMicaEnabled
      ? [
          {
            name: t("tabs.mica"),
            href: `/portfolio/my-assets/${assettype}/${address}/regulations/mica`,
          },
        ]
      : []),
  ];

  return tabItems;
};

export async function AssetTabs(params: AssetTabsProps) {
  const tabItems = await tabs(params);

  return <TabNavigation items={tabItems} />;
}
