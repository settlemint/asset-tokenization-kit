import {
  AssetExtensionEnum,
  type AssetExtension,
} from "@atk/zod/asset-extensions";
import {
  ComplianceTypeIdEnum,
  type ComplianceTypeId,
} from "@atk/zod/compliance";
import type { Address } from "viem";

export type AssetTabBadgeType =
  | "holders"
  | "events"
  | "actions"
  | "allowlist"
  | "blocklist"
  | "denomination-asset";

export type AssetTabKey =
  | "tokenInformation"
  | "holders"
  | "events"
  | "actions"
  | "permissions"
  | "allowlist"
  | "blocklist"
  | "denominationAsset"
  | "yield";

export type AssetTabRequirement = {
  extensions?: AssetExtension[];
  complianceModules?: ComplianceTypeId[];
};

export interface AssetTabConfigurationParams {
  factoryAddress: Address;
  assetAddress: Address;
  assetExtensions: AssetExtension[];
  assetComplianceModules: ComplianceTypeId[];
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

  // Extension-based tabs
  permissions: { extensions: [AssetExtensionEnum.ACCESS_MANAGED] },
  yield: { extensions: [AssetExtensionEnum.YIELD] },
  denominationAsset: {
    extensions: [AssetExtensionEnum.BOND],
  },

  // Compliance-based tabs (placeholder logic)
  allowlist: {
    complianceModules: [
      ComplianceTypeIdEnum.IdentityAllowListComplianceModule,
      ComplianceTypeIdEnum.CountryAllowListComplianceModule,
    ],
  },
  blocklist: {
    complianceModules: [
      ComplianceTypeIdEnum.AddressBlockListComplianceModule,
      ComplianceTypeIdEnum.IdentityBlockListComplianceModule,
      ComplianceTypeIdEnum.CountryBlockListComplianceModule,
    ],
  },

  // Future: tabs requiring both extensions and compliance modules
  // example: { extensions: ["YIELD"], complianceModules: ["SomeModule"] }
};

export function satisfiesRequirement(
  assetExtensions: AssetExtension[],
  assetComplianceModules: ComplianceTypeId[],
  requirement: AssetTabRequirement
): boolean {
  // Check extensions requirement
  if (requirement.extensions?.length) {
    const hasAllExtensions = requirement.extensions.every((ext) =>
      assetExtensions.includes(ext)
    );
    if (!hasAllExtensions) return false;
  }

  // Check compliance modules requirement
  if (requirement.complianceModules?.length) {
    const hasAllComplianceModules = requirement.complianceModules.some((m) =>
      assetComplianceModules.includes(m)
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
  assetExtensions,
  assetComplianceModules = [],
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
      tabKey: "denominationAsset",
      href: `${baseUrl}/denomination-asset`,
      badgeType: "denomination-asset",
    },
  ];

  return allTabs.filter((tab) =>
    satisfiesRequirement(
      assetExtensions,
      assetComplianceModules,
      ASSET_TAB_REQUIREMENTS[tab.tabKey]
    )
  );
}
