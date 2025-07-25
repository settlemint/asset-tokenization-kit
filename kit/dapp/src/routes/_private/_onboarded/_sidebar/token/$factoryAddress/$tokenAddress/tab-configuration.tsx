import { TabBadge } from "@/components/assets/tab-badge";
import type { TabItemProps } from "@/components/tab-navigation/tab-navigation";
import {
  hasAllowlist,
  hasBlocklist,
  hasUnderlyingAssets,
  hasYield,
  isMicaEnabledForAsset,
} from "@/lib/utils/features-enabled";
import type { AssetType } from "@/lib/zod/validators/asset-types";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";

interface AssetTabConfigurationParams {
  factoryAddress: Address;
  assetAddress: Address;
  assetType: AssetType;
}

/**
 * Generates the tab configuration for an asset based on its asset type and features
 */
export async function getAssetTabConfiguration({
  factoryAddress,
  assetAddress,
  assetType,
}: AssetTabConfigurationParams): Promise<TabItemProps[]> {
  const baseUrl = `/token/${factoryAddress}/${assetAddress}`;
  const { t } = useTranslation(["tokens", "assets", "common"]);

  // Check if MICA is enabled for this asset
  let isMicaEnabled = false;
  try {
    isMicaEnabled = await isMicaEnabledForAsset(assetType, assetAddress);
  } catch (error) {
    console.error("Failed to check MICA status:", error);
  }

  const tabs: TabItemProps[] = [
    {
      name: t("tokens:tabs.tokenInformation"),
      href: baseUrl,
    },
    {
      name: (
        <>
          {t("tokens:tabs.holders")}
          <TabBadge
            address={assetAddress}
            assetType={assetType}
            badgeType="holders"
          />
        </>
      ),
      href: `${baseUrl}/holders`,
    },
  ];

  // Add yield tab for bonds
  if (hasYield(assetType)) {
    tabs.push({
      name: t("tokens:tabs.yield"),
      href: `${baseUrl}/yield`,
    });
  }

  // Add events tab
  tabs.push({
    name: (
      <>
        {t("tokens:tabs.events")}
        <TabBadge
          address={assetAddress}
          assetType={assetType}
          badgeType="events"
        />
      </>
    ),
    href: `${baseUrl}/events`,
  });

  // Add actions tab
  tabs.push({
    name: (
      <>
        {t("tokens:tabs.actions")}
        <TabBadge
          address={assetAddress}
          assetType={assetType}
          badgeType="actions"
        />
      </>
    ),
    href: `${baseUrl}/actions`,
  });

  // Add permissions tab
  tabs.push({
    name: t("tokens:tabs.permissions"),
    href: `${baseUrl}/permissions`,
  });

  // Add allowlist tab for deposits
  if (hasAllowlist(assetType)) {
    tabs.push({
      name: (
        <>
          {t("tokens:tabs.allowlist")}
          <TabBadge
            address={assetAddress}
            assetType={assetType}
            badgeType="allowlist"
          />
        </>
      ),
      href: `${baseUrl}/allowlist`,
    });
  }

  // Add blocklist tab for non-deposit assets
  if (hasBlocklist(assetType)) {
    tabs.push({
      name: (
        <>
          {t("tokens:tabs.blocklist")}
          <TabBadge
            address={assetAddress}
            assetType={assetType}
            badgeType="blocklist"
          />
        </>
      ),
      href: `${baseUrl}/blocklist`,
    });
  }

  // Add underlying assets tab for bonds and funds
  if (hasUnderlyingAssets(assetType)) {
    tabs.push({
      name: (
        <>
          {t("tokens:tabs.underlyingAssets")}
          <TabBadge
            address={assetAddress}
            assetType={assetType}
            badgeType="underlying-assets"
          />
        </>
      ),
      href: `${baseUrl}/underlying-assets`,
    });
  }

  // Add MICA regulation tab if enabled
  if (isMicaEnabled) {
    tabs.push({
      name: t("tokens:tabs.mica"),
      href: `${baseUrl}/regulations/mica`,
    });
  }

  return tabs;
}
