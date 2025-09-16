import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { ClaimsListOutput } from "@/orpc/routes/system/identity/claims/routes/claims.list.schema";

interface ClaimStatusBadgeProps {
  claimsData: ClaimsListOutput;
}

/**
 * Displays the overall status of a user's claims based on their identity data.
 *
 * Status rules:
 * - Not registered → outline badge
 * - Registered with active claims → green badge
 * - Registered with only revoked claims → destructive badge
 * - Registered with no claims → secondary badge
 */
export function ClaimStatusBadge({ claimsData }: ClaimStatusBadgeProps) {
  const { t } = useTranslation("claims");

  const { isRegistered, claims } = claimsData;

  const { activeClaims, revokedClaims } = useMemo(() => {
    let active = 0;
    let revoked = 0;
    for (const claim of claims) {
      if (claim.revoked) {
        revoked += 1;
      } else {
        active += 1;
      }
    }
    return { activeClaims: active, revokedClaims: revoked };
  }, [claims]);

  if (!isRegistered) {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground"
        aria-label={t("status.unregisteredAriaLabel", "Identity not registered")}
      >
        {t("status.unregistered", "Not registered")}
      </Badge>
    );
  }

  if (activeClaims > 0) {
    return (
      <Badge
        variant="default"
        className="bg-green-500 hover:bg-green-600"
        aria-label={t("status.activeAriaLabel", "Active claims present")}
      >
        {t("status.active", "Active claims")}
      </Badge>
    );
  }

  if (revokedClaims > 0) {
    return (
      <Badge
        variant="destructive"
        aria-label={t(
          "status.revokedAriaLabel",
          "All claims revoked"
        )}
      >
        {t("status.revoked", "Claims revoked")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-yellow-500 text-white hover:bg-yellow-600"
      aria-label={t(
        "status.noneAriaLabel",
        "No claims issued"
      )}
    >
      {t("status.none", "No claims")}
    </Badge>
  );
}

export default ClaimStatusBadge;
