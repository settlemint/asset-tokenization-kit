import { Badge } from "@/components/ui/badge";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";

interface UserStatusBadgeProps {
  user: User;
}

/**
 * Status badge component for user registration status
 * Displays the current state of user registration and connection with accessibility support
 */
export function UserStatusBadge({ user }: UserStatusBadgeProps) {
  if (user.isRegistered) {
    return (
      <Badge
        variant="default"
        className="bg-green-500 hover:bg-green-600"
        aria-label="User is registered and verified on-chain"
      >
        Registered
      </Badge>
    );
  }

  if (user.wallet) {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-500 hover:bg-yellow-600 text-white"
        aria-label="User has connected wallet but is not yet registered on-chain"
      >
        Pending Registration
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-muted-foreground"
      aria-label="User has not connected a wallet"
    >
      Not Connected
    </Badge>
  );
}
