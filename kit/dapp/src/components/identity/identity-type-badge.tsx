import { Badge } from "@/components/ui/badge";
import { FileText, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IdentityTypeBadgeProps {
  isContract: boolean;
}

export function IdentityTypeBadge({ isContract }: IdentityTypeBadgeProps) {
  const { t } = useTranslation("identities");
  const entityType = isContract ? "contract" : "account";

  return (
    <Badge
      variant="default"
      className={
        isContract
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-purple-500 hover:bg-purple-600"
      }
    >
      {isContract ? (
        <FileText className="h-4 w-4" />
      ) : (
        <User className="h-4 w-4" />
      )}
      {t(`identityTable.types.${entityType}`)}
    </Badge>
  );
}
