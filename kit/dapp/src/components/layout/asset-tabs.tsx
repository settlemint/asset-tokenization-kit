import {
  hasAllowlist,
  hasBlocklist,
  hasUnderlyingAsset,
  hasYield,
} from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/features-enabled";
import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
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

  const [details, balances, events, assetUsers] = await Promise.all([
    getAssetDetail({ address, assettype }),
    getAssetBalanceList({ wallet: address }),
    getAssetEventsList({ asset: address }),
    getAssetUsersDetail({ address }),
  ]);

  return [
    {
      name: t("tabs.details"),
      href: `/assets/${assettype}/${address}`,
    },
    {
      name: t("tabs.holders"),
      href: `/assets/${assettype}/${address}/holders`,
      badge: details.totalHolders,
    },
    ...(hasYield(assettype)
      ? [
          {
            name: t("tabs.yield"),
            href: `/assets/${assettype}/${address}/yield`,
          },
        ]
      : []),
    {
      name: t("tabs.events"),
      href: `/assets/${assettype}/${address}/events`,
      badge: events.length,
    },

    {
      name: t("tabs.permissions"),
      href: `/assets/${assettype}/${address}/permissions`,
    },
    ...(hasAllowlist(assettype)
      ? [
          {
            name: t("tabs.allowlist"),
            href: `/assets/${assettype}/${address}/allowlist`,
            badge: assetUsers.allowlist.length,
          },
        ]
      : []),
    ...(hasBlocklist(assettype)
      ? [
          {
            name: t("tabs.blocklist"),
            href: `/assets/${assettype}/${address}/blocklist`,
            badge: assetUsers.blocklist.length,
          },
        ]
      : []),
    ...(hasUnderlyingAsset(assettype)
      ? [
          {
            name: t("tabs.underlying-assets"),
            href: `/assets/${assettype}/${address}/underlying-assets`,
            badge: balances.length,
          },
        ]
      : []),
  ];
};

export async function AssetTabs(params: AssetTabsProps) {
  const tabItems = await tabs(params);

  return <TabNavigation items={tabItems} />;
}
