import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { Badge } from "@/components/ui/badge";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Default identity detail page that shows comprehensive identity information
 *
 * This is the default tab/view when viewing a specific identity address.
 * It displays all identity data, claims information, and verification status
 * for the specified address.
 *
 * Route path: `/admin/identity-management/{address}`
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/admin/identity-management/$address/"
)({
  errorComponent: DefaultCatchBoundary,
  component: IdentityDetailPage,
});

function IdentityDetailPage() {
  const { claimsData } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/admin/identity-management/$address",
  });
  const { t } = useTranslation(["identities", "common"]);

  return (
    <>
      <DetailGrid>
        <DetailGridItem
          label={t("identities:fields.identityAddress")}
          info={t("identities:fields.identityAddressInfo")}
          value={claimsData.identity}
          type="address"
          showPrettyName={false}
        />

        <DetailGridItem
          label={t("identities:fields.registrationStatus")}
          info={t("identities:fields.registrationStatusInfo")}
        >
          <Badge variant={claimsData.isRegistered ? "default" : "secondary"}>
            {claimsData.isRegistered
              ? t("identities:status.registered")
              : t("identities:status.notRegistered")}
          </Badge>
        </DetailGridItem>

        <DetailGridItem
          label={t("identities:fields.linkedAccount")}
          info={t("identities:fields.linkedAccountInfo")}
          value={claimsData.accountId}
          type="address"
          showPrettyName={false}
          emptyValue={t("common:none")}
        />

        <DetailGridItem
          label={t("identities:fields.createdAt")}
          info={t("identities:fields.createdAtInfo")}
          value={new Date().toISOString()}
          type="date"
        />

        <DetailGridItem
          label={t("identities:fields.lastModified")}
          info={t("identities:fields.lastModifiedInfo")}
          value={new Date().toISOString()}
          type="date"
          dateOptions={{ relative: true }}
        />
      </DetailGrid>

      <DetailGrid title={t("identities:details.summary.total")}>
        <DetailGridItem
          label={t("identities:details.summary.total")}
          value={claimsData.claims.length.toString()}
          type="text"
        />

        <DetailGridItem
          label={t("identities:details.summary.verified")}
          value={claimsData.claims.filter((c) => !c.revoked).length.toString()}
          type="text"
        />

        <DetailGridItem
          label={t("identities:details.summary.rejectedExpired")}
          value={claimsData.claims.filter((c) => c.revoked).length.toString()}
          type="text"
        />
      </DetailGrid>
    </>
  );
}
