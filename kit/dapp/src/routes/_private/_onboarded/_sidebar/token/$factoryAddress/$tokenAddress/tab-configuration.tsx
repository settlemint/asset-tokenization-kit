import {
  hasAllowlist,
  hasBlocklist,
  hasUnderlyingAssets,
  hasYield,
  isMicaEnabledForAsset,
} from "@/lib/utils/features-enabled";
import type { AssetType } from "@/lib/zod/validators/asset-types";
import type { Address } from "viem";

interface AssetTabConfigurationParams {
  factoryAddress: Address;
  assetAddress: Address;
  assetType: AssetType;
}

interface TabConfig {
  href: string;
  tabKey: 'tokenInformation' | 'holders' | 'events' | 'actions' | 'permissions' | 'allowlist' | 'blocklist' | 'underlyingAssets' | 'yield' | 'mica';
  badgeType?: "holders" | "events" | "actions" | "allowlist" | "blocklist" | "underlying-assets";
}

/**
 * Generates the tab configuration for an asset based on its asset type and features
 */
export async function getAssetTabConfiguration({
  factoryAddress,
  assetAddress,
  assetType,
}: AssetTabConfigurationParams): Promise<TabConfig[]> {
  const baseUrl = `/token/${factoryAddress}/${assetAddress}`;

  // Check if MICA is enabled for this asset
  let isMicaEnabled = false;
  try {
    isMicaEnabled = await isMicaEnabledForAsset(assetType, assetAddress);
  } catch (error) {
    console.error("Failed to check MICA status:", error);
  }

  const tabs: TabConfig[] = [
    {
      tabKey: "tokenInformation",
      href: baseUrl,
    },
    {
      tabKey: "holders",
      href: `${baseUrl}/holders`,
      badgeType: "holders",
    },
  ];

  // Add yield tab for bonds
  if (hasYield(assetType)) {
    tabs.push({
      tabKey: "yield",
      href: `${baseUrl}/yield`,
    });
  }

  // Add events tab
  tabs.push({
    tabKey: "events",
    href: `${baseUrl}/events`,
    badgeType: "events",
  });

  // Add actions tab
  tabs.push({
    tabKey: "actions",
    href: `${baseUrl}/actions`,
    badgeType: "actions",
  });

  // Add permissions tab
  tabs.push({
    tabKey: "permissions",
    href: `${baseUrl}/permissions`,
  });

  // Add allowlist tab for deposits
  if (hasAllowlist(assetType)) {
    tabs.push({
      tabKey: "allowlist",
      href: `${baseUrl}/allowlist`,
      badgeType: "allowlist",
    });
  }

  // Add blocklist tab for non-deposit assets
  if (hasBlocklist(assetType)) {
    tabs.push({
      tabKey: "blocklist",
      href: `${baseUrl}/blocklist`,
      badgeType: "blocklist",
    });
  }

  // Add underlying assets tab for bonds and funds
  if (hasUnderlyingAssets(assetType)) {
    tabs.push({
      tabKey: "underlyingAssets",
      href: `${baseUrl}/underlying-assets`,
      badgeType: "underlying-assets",
    });
  }

  // Add MICA regulation tab if enabled
  if (isMicaEnabled) {
    tabs.push({
      tabKey: "mica",
      href: `${baseUrl}/regulations/mica`,
    });
  }

  return tabs;
}
