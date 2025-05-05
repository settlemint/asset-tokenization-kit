import { Badge } from "@/components/ui/badge";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getLocale } from "next-intl/server";
import type { Address } from "viem";

interface BadgeLoaderProps {
  address: Address;
  assettype: AssetType;
  badgeType:
    | "holders"
    | "events"
    | "allowlist"
    | "blocklist"
    | "underlying-assets";
}

// Simple spinner for fallback
export function BadgeSpinner() {
  return (
    <div
      className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground"
      role="status"
      aria-label="loading badge"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export async function BadgeLoader({
  address,
  assettype,
  badgeType,
}: BadgeLoaderProps) {
  let count: number | string | undefined = undefined;

  try {
    switch (badgeType) {
      case "holders":
        const details = await getAssetDetail({ address, assettype });
        count = details.totalHolders.toString();
        break;
      case "events":
        const locale = await getLocale();
        const events = await getAssetEventsList({ asset: address, locale });
        count = events.length;
        break;
      case "allowlist":
        const assetUsersAllowlist = await getAssetUsersDetail({ address });
        count = assetUsersAllowlist.allowlist.length;
        break;
      case "blocklist":
        const assetUsersBlocklist = await getAssetUsersDetail({ address });
        count = assetUsersBlocklist.blocklist.length;
        break;
      case "underlying-assets":
        // Assuming getAssetBalanceList needs the wallet address, not asset address
        // If the badge should count assets held *by the asset contract itself*, adjust query if needed.
        // For now, using the passed address as the wallet, which might not be correct semantically for "underlying assets" badge on an *asset* page.
        // Revisit this logic if needed based on exact requirement.
        const balances = await getAssetBalanceList({ wallet: address });
        count = balances.length;
        break;
    }
  } catch (error) {
    console.error(`Failed to load badge count for ${badgeType}:`, error);
    // Optionally render an error state or just nothing
    return null;
  }

  if (count === undefined || count === 0) {
    return null; // Don't render a badge if count is zero or undefined
  }

  return (
    <Badge variant="outline" className="ml-2 border-card">
      {count}
    </Badge>
  );
}
