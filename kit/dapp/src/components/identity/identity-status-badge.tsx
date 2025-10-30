import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface IdentityStatusBadgeProps {
  isRegistered: boolean;
}

export function IdentityStatusBadge({
  isRegistered,
}: IdentityStatusBadgeProps) {
  const { t } = useTranslation("identities");
  const statusKey = isRegistered
    ? "status.registered"
    : "status.pendingRegistration";

  return (
    <Badge variant={isRegistered ? "default" : "outline"}>{t(statusKey)}</Badge>
  );
}
