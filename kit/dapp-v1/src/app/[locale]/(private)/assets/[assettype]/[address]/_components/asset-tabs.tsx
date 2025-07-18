import type { TabItemProps } from "@/components/blocks/tab-navigation/tab-item";
import { TabNavigation } from "@/components/blocks/tab-navigation/tab-navigation";
import {
  hasAllowlist,
  hasBlocklist,
  hasUnderlyingAsset,
  hasYield,
  isMicaEnabledForAsset,
} from "@/lib/utils/features-enabled";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";
import { BadgeLoader, BadgeSpinner } from "./badge-loader";

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
      href: `/assets/${assettype}/${address}`,
    },
    {
      name: (
        <>
          {t("tabs.holders")}
          <Suspense fallback={<BadgeSpinner />}>
            <BadgeLoader
              address={address}
              assettype={assettype}
              badgeType="holders"
            />
          </Suspense>
        </>
      ),
      href: `/assets/${assettype}/${address}/holders`,
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
      name: (
        <>
          {t("tabs.events")}
          <Suspense fallback={<BadgeSpinner />}>
            <BadgeLoader
              address={address}
              assettype={assettype}
              badgeType="events"
            />
          </Suspense>
        </>
      ),
      href: `/assets/${assettype}/${address}/events`,
    },
    {
      name: (
        <>
          {t("tabs.actions")}
          <Suspense fallback={<BadgeSpinner />}>
            <BadgeLoader
              address={address}
              assettype={assettype}
              badgeType="actions"
            />
          </Suspense>
        </>
      ),
      href: `/assets/${assettype}/${address}/actions`,
    },
    {
      name: t("tabs.permissions"),
      href: `/assets/${assettype}/${address}/permissions`,
    },
    ...(hasAllowlist(assettype)
      ? [
          {
            name: (
              <>
                {t("tabs.allowlist")}
                <Suspense fallback={<BadgeSpinner />}>
                  <BadgeLoader
                    address={address}
                    assettype={assettype}
                    badgeType="allowlist"
                  />
                </Suspense>
              </>
            ),
            href: `/assets/${assettype}/${address}/allowlist`,
          },
        ]
      : []),
    ...(hasBlocklist(assettype)
      ? [
          {
            name: (
              <>
                {t("tabs.blocklist")}
                <Suspense fallback={<BadgeSpinner />}>
                  <BadgeLoader
                    address={address}
                    assettype={assettype}
                    badgeType="blocklist"
                  />
                </Suspense>
              </>
            ),
            href: `/assets/${assettype}/${address}/blocklist`,
          },
        ]
      : []),
    ...(hasUnderlyingAsset(assettype)
      ? [
          {
            name: (
              <>
                {t("tabs.underlying-assets")}
                <Suspense fallback={<BadgeSpinner />}>
                  <BadgeLoader
                    address={address}
                    assettype={assettype}
                    badgeType="underlying-assets"
                  />
                </Suspense>
              </>
            ),
            href: `/assets/${assettype}/${address}/underlying-assets`,
          },
        ]
      : []),
    ...(isMicaEnabled
      ? [
          {
            name: t("tabs.mica"),
            href: `/assets/${assettype}/${address}/regulations/mica`,
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
