import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface EntityStatusBadgeProps {
  isRegistered: boolean;
}

export function EntityStatusBadge({ isRegistered }: EntityStatusBadgeProps) {
  const { t } = useTranslation("entities");
  const statusKey = isRegistered
    ? "status.registered"
    : "status.pendingRegistration";

  return (
    <Badge variant={isRegistered ? "default" : "outline"}>{t(statusKey)}</Badge>
  );
}
