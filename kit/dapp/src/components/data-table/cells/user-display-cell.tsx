import { Web3Address } from "@/components/web3/web3-address";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";

interface UserDisplayCellProps {
  user: User;
}

/**
 * Reusable user display cell component for data tables.
 * Shows user name or Web3 address with badge.
 */
export function UserDisplayCell({ user }: UserDisplayCellProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name;

  if (!user.wallet) {
    return <span className="font-medium">{displayName}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Web3Address
        address={user.wallet}
        size="small"
        showPrettyName={true}
        showBadge={true}
      />
    </div>
  );
}
