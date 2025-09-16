import { Badge } from "@/components/ui/badge";
import type { ClaimsListOutput } from "@/orpc/routes/system/identity/claims/routes/claims.list.schema";
import { useTranslation } from "react-i18next";

interface ClaimStatusBadgeProps {
  claimsData: ClaimsListOutput;
}

/**
 * Status badge component for claim/identity registration status
 * Displays the current state of user identity and claims with accessibility support
 */
export function ClaimStatusBadge({ claimsData }: ClaimStatusBadgeProps) {
  const { t } = useTranslation("claims");

  if (claimsData.isRegistered) {
    const hasClaims = claimsData.claims.length > 0;
    
    if (hasClaims) {
      return (
        <Badge
          variant="default"
          className="bg-green-500 hover:bg-green-600"
          aria-label={t("status.verifiedAriaLabel")}
        >
          {t("status.verified")}
        </Badge>
      );
    }
    
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-500 hover:bg-yellow-600 text-white"
        aria-label={t("status.registeredAriaLabel")}
      >
        {t("status.registered")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-muted-foreground"
      aria-label={t("status.notRegisteredAriaLabel")}
    >
      {t("status.notRegistered")}
    </Badge>
  );
}