import { Badge } from "@/components/ui/badge";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useTranslation } from "react-i18next";

interface UserStatusBadgeProps {
  user: User;
  identity?: Identity;
  isRegistered?: boolean;
}

/**
 * Status badge component for user registration status
 * Displays the current state of user registration and connection with accessibility support
 */
export function UserStatusBadge({
  user,
  isRegistered,
  identity,
}: UserStatusBadgeProps) {
  const { t } = useTranslation("user");

  if (isRegistered || identity?.registered) {
    return (
      <Badge
        variant="default"
        className="bg-green-500 hover:bg-green-600"
        aria-label={t("management.table.status.registeredAriaLabel")}
      >
        {t("management.table.status.registered")}
      </Badge>
    );
  }

  if (user.wallet) {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-500 hover:bg-yellow-600 text-white"
        aria-label={t("management.table.status.pendingAriaLabel")}
      >
        {t("management.table.status.pending")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-muted-foreground"
      aria-label={t("management.table.status.notConnectedAriaLabel")}
    >
      {t("management.table.status.notConnected")}
    </Badge>
  );
}
