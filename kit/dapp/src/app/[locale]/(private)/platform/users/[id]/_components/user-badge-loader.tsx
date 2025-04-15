import { Badge } from "@/components/ui/badge";
import { getUserDetail } from "@/lib/queries/user/user-detail";

interface UserBadgeLoaderProps {
  userId: string;
  badgeType: "holdings"; // Currently only one type needed
}

// Simple spinner for fallback (copied from layout/badge-loader for simplicity)
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

export async function UserBadgeLoader({
  userId,
  badgeType,
}: UserBadgeLoaderProps) {
  let count: number | undefined = undefined;

  try {
    switch (badgeType) {
      case "holdings":
        // Fetch user details specifically for the asset count
        const user = await getUserDetail({ id: userId });
        count = user?.assetCount;
        break;
      // Add other cases if more user-specific badges are needed later
    }
  } catch (error) {
    console.error(`Failed to load user badge count for ${badgeType}:`, error);
    return null; // Render nothing on error
  }

  if (count === undefined || count === 0) {
    return null; // Don't render badge if count is zero or undefined
  }

  return (
    <Badge variant="outline" className="ml-2 border-card">
      {count}
    </Badge>
  );
}
