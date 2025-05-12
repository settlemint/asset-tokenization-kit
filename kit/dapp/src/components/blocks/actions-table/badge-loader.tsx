import { Badge } from "@/components/ui/badge";
import { getActionsList } from "@/lib/queries/actions/actions-list";
import type {
  ActionState,
  ActionType,
} from "@/lib/queries/actions/actions-schema";
import type { Address } from "viem";

interface BadgeLoaderProps {
  state: ActionState;
  type: ActionType;
  userAddress: Address;
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
  state,
  type,
  userAddress,
}: BadgeLoaderProps) {
  const actions = await getActionsList({
    state,
    type,
    userAddress,
  });

  const count = actions.length;

  if (count === 0) {
    return null; // Don't render a badge if count is zero
  }

  return (
    <Badge variant="outline" className="ml-2 border-card">
      {count}
    </Badge>
  );
}
