import { Badge } from "@/components/ui/badge";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useTranslation } from "react-i18next";
import { zeroAddress } from "viem";

interface UserStatusBadgeProps {
  user: User;
  identity?: Partial<Identity>;
  isRegistered?: boolean;
  isAdmin?: boolean | null;
}

/**
 * Status badge component for user registration status
 * Displays the current state of user registration and connection with accessibility support
 */
export function UserStatusBadge({
  user,
  isRegistered,
  identity,
  isAdmin,
}: UserStatusBadgeProps) {
  const { t } = useTranslation("participants");

  if (user.wallet === zeroAddress) {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground"
        aria-label={t("status.notConnectedAriaLabel")}
      >
        {t("status.notConnected")}
      </Badge>
    );
  }

  const hasIdentity = identity?.id;
  if (user.wallet && !hasIdentity) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-gray-500 hover:bg-gray-600 text-white"
          aria-label={t("status.identityNeededAriaLabel")}
        >
          {t("status.identityNeeded")}
        </Badge>
        {isAdmin && (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            {t("status.admin")}
          </Badge>
        )}
      </div>
    );
  }

  // Check if registered - identity.registered can be an object {isRegistered: true, country: ...} or false
  const isIdentityRegistered = isRegistered ?? identity?.registered;
  if (!isIdentityRegistered) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            {t("status.admin")}
          </Badge>
        )}
        {isAdmin ? (
          <Badge
            variant="secondary"
            className="bg-blue-500 hover:bg-blue-600"
            aria-label={t("status.notRegisteredAriaLabel")}
          >
            {t("status.notRegistered")}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            aria-label={t("status.pendingRegistrationAriaLabel")}
          >
            {t("status.pendingRegistration")}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="default"
        className="bg-green-500 hover:bg-green-600"
        aria-label={t("status.registeredAriaLabel")}
      >
        {t("status.registered")}
      </Badge>
      {isAdmin && (
        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
          {t("status.admin")}
        </Badge>
      )}
    </div>
  );
}
