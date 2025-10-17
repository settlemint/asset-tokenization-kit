import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { IdentityTypeBadge } from "@/components/identity/identity-type-badge";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Default identity detail page that shows comprehensive identity information
 *
 * This is the default tab/view when viewing a specific identity address.
 * It displays all identity data, claims information, and verification status
 * for the specified address.
 *
 * Route path: `/participants/entities/{address}`
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/participants/entities/$address/"
)({
  errorComponent: DefaultCatchBoundary,
  component: IdentityDetailPage,
});

function IdentityDetailPage() {
  const { claimsData } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/participants/entities/$address",
  });
  const { t } = useTranslation(["identities", "common"]);

  // Determine entity type and entity information
  const isContract = claimsData.isContract;
  const entityAddress = claimsData.account.id;

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
          label={t("identities:fields.linkedEntity")}
          info={t("identities:fields.linkedEntityInfo")}
          value={entityAddress ?? t("common:none")}
          type="address"
          showPrettyName={false}
        />

        <DetailGridItem
          label={t("identities:identityTable.columns.type")}
          info={t("identities:fields.linkedEntityInfo")}
        >
          <IdentityTypeBadge isContract={isContract} />
        </DetailGridItem>
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
