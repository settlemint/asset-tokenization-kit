import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface IdentityStatusBadgeProps {
  isRegistered: boolean;
}

export function IdentityStatusBadge({
  isRegistered,
}: IdentityStatusBadgeProps) {
  const { t } = useTranslation("identities");

  return (
    <Badge variant={isRegistered ? "default" : "outline"}>
      {isRegistered
        ? t("status.active", { defaultValue: "Active" })
        : t("status.inactive", { defaultValue: "Inactive" })}
    </Badge>
  );
}
