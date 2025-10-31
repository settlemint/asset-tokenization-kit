import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface EntityStatusBadgeProps {
  isRegistered: boolean;
}

export function EntityStatusBadge({ isRegistered }: EntityStatusBadgeProps) {
  const { t } = useTranslation("entities");
  const statusKey: "status.registered" | "status.pending" = isRegistered
    ? "status.registered"
    : "status.pending";

  return (
    <Badge variant={isRegistered ? "default" : "outline"}>{t(statusKey)}</Badge>
  );
}
