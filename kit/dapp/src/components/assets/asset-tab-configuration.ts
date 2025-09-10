import {
  AssetExtensionEnum,
  type AssetExtension,
} from "@atk/zod/asset-extensions";
import type { Address } from "viem";

export type AssetTabBadgeType =
  | "holders"
  | "events"
  | "actions"
  | "allowlist"
  | "blocklist"
  | "underlying-assets";

export type AssetTabKey =
  | "tokenInformation"
  | "holders"
  | "events"
  | "actions"
  | "permissions"
  | "allowlist"
  | "blocklist"
  | "underlyingAssets"
  | "yield";

export type AssetTabRequirement = {
  extensions?: AssetExtension[];
  complianceModules?: string[]; // TODO: Replace with proper compliance module types when API available
};

export interface AssetTabConfigurationParams {
  factoryAddress: Address;
  assetAddress: Address;
  tokenExtensions: AssetExtension[];
  tokenComplianceModules?: string[]; // TODO: Replace with proper type when API available
}

export interface AssetTabConfig {
  href: string;
  tabKey: AssetTabKey;
  badgeType?: AssetTabBadgeType;
}

export const ASSET_TAB_REQUIREMENTS: Record<
  AssetTabConfig["tabKey"],
  AssetTabRequirement
> = {
  // Always available tabs
  tokenInformation: {},
  holders: {},
  events: {},
  actions: {},
  permissions: { extensions: [AssetExtensionEnum.ACCESS_MANAGED] },

  // Extension-based tabs
  yield: { extensions: [AssetExtensionEnum.YIELD] },
  underlyingAssets: { extensions: [AssetExtensionEnum.FUND] },

  // Compliance-based tabs (placeholder logic)
  allowlist: {
    complianceModules: ["AllowlistModule"], // TODO: Get actual compliance module names from API
  },
  blocklist: {
    complianceModules: ["BlocklistModule"], // TODO: Get actual compliance module names from API
  },

  // Future: tabs requiring both extensions and compliance modules
  // example: { extensions: ["YIELD"], complianceModules: ["SomeModule"] }
};

function satisfiesTabRequirement(
  tokenExtensions: AssetExtension[],
  tokenComplianceModules: string[], // TODO: Replace with proper type when API available
  requirement: AssetTabRequirement
): boolean {
  // Check extensions requirement
  if (requirement.extensions?.length) {
    const hasAllExtensions = requirement.extensions.every((ext) =>
      tokenExtensions.includes(ext)
    );
    if (!hasAllExtensions) return false;
  }

  // Check compliance modules requirement
  if (requirement.complianceModules?.length) {
    // TODO: Implement proper compliance module checking when API is available
    // For now, use placeholder logic based on asset type patterns
    const hasAllComplianceModules = requirement.complianceModules.every(
      (module) => tokenComplianceModules.includes(module)
    );
    if (!hasAllComplianceModules) return false;
  }

  return true;
}

/**
 * Generates the tab configuration for an asset based on its extensions and compliance modules
 */
export function getAssetTabConfiguration({
  factoryAddress,
  assetAddress,
  tokenExtensions,
  tokenComplianceModules = [], // TODO: Get from API when available
}: AssetTabConfigurationParams): AssetTabConfig[] {
  const baseUrl = `/token/${factoryAddress}/${assetAddress}`;

  const allTabs: (AssetTabConfig & {
    tabKey: keyof typeof ASSET_TAB_REQUIREMENTS;
  })[] = [
    { tabKey: "tokenInformation", href: baseUrl },
    { tabKey: "holders", href: `${baseUrl}/holders`, badgeType: "holders" },
    { tabKey: "yield", href: `${baseUrl}/yield` },
    { tabKey: "events", href: `${baseUrl}/events`, badgeType: "events" },
    { tabKey: "actions", href: `${baseUrl}/actions`, badgeType: "actions" },
    { tabKey: "permissions", href: `${baseUrl}/permissions` },
    {
      tabKey: "allowlist",
      href: `${baseUrl}/allowlist`,
      badgeType: "allowlist",
    },
    {
      tabKey: "blocklist",
      href: `${baseUrl}/blocklist`,
      badgeType: "blocklist",
    },
    {
      tabKey: "underlyingAssets",
      href: `${baseUrl}/underlying-assets`,
      badgeType: "underlying-assets",
    },
  ];

  return allTabs.filter((tab) =>
    satisfiesTabRequirement(
      tokenExtensions,
      tokenComplianceModules,
      ASSET_TAB_REQUIREMENTS[tab.tabKey]
    )
  );
}
