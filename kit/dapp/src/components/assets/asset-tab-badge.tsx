import { Badge } from "@/components/ui/badge";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { Suspense } from "react";
import type { AssetTabBadgeType } from "./asset-tab-configuration";

const logger = createLogger();

interface AssetTabBadgeProps {
  badgeType: AssetTabBadgeType;
}

/**
 * Simple spinner for fallback while loading badge counts
 */
export function AssetTabBadgeSpinner() {
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

/**
 * Component that loads and displays badge counts for asset tabs
 */
function AssetTabBadgeLoader({ badgeType }: AssetTabBadgeProps) {
  let count: number | undefined;

  try {
    switch (badgeType) {
      case "holders":
        // TODO: Implement holders count query when available
        count = 0;
        break;
      case "events":
        // TODO: Implement events count query when available
        count = 0;
        break;
      case "actions":
        // TODO: Implement actions count query when available
        count = 0;
        break;
      case "allowlist":
        // TODO: Implement allowlist count query when available
        count = 0;
        break;
      case "blocklist":
        // TODO: Implement blocklist count query when available
        count = 0;
        break;
      case "denomination-asset":
        // TODO: Implement denomination asset count query when available
        count = 0;
        break;
    }
  } catch (error) {
    logger.error(`Failed to load badge count for ${badgeType}:`, error);
    return null;
  }

  if (count === undefined || count === 0) {
    return null;
  }

  return (
    <Badge variant="outline" className="ml-2 border-card">
      {count}
    </Badge>
  );
}

/**
 * Tab badge component with Suspense wrapper
 */
export function AssetTabBadge(props: AssetTabBadgeProps) {
  return (
    <Suspense fallback={<AssetTabBadgeSpinner />}>
      <AssetTabBadgeLoader {...props} />
    </Suspense>
  );
}
