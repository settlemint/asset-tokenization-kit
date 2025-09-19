import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IdentityStatusBadgeProps {
  isRegistered: boolean;
}

export function IdentityStatusBadge({
  isRegistered,
}: IdentityStatusBadgeProps) {
  const { t } = useTranslation("identities");

  return (
    <Badge
      variant={isRegistered ? "default" : "outline"}
      className={
        isRegistered
          ? "bg-green-500 hover:bg-green-600"
          : "text-muted-foreground"
      }
    >
      {isRegistered ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      {isRegistered ? t("status.registered") : t("status.notRegistered")}
    </Badge>
  );
}
