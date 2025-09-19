import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { IdentityStatusBadge } from "@/components/identity/identity-status-badge";
import { IdentityTypeBadge } from "@/components/identity/identity-type-badge";
import { Web3Address } from "@/components/web3/web3-address";
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

  // Determine entity type and entity information
  const isContract = Boolean(claimsData.contract);
  const entityAddress = isContract
    ? claimsData.contract?.id
    : claimsData.account?.id;

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
          <IdentityStatusBadge isRegistered={claimsData.isRegistered} />
        </DetailGridItem>

        <DetailGridItem
          label={t("identities:fields.linkedEntity")}
          info={t("identities:fields.linkedEntityInfo")}
        >
          {entityAddress ? (
            <div className="flex flex-col gap-1">
              {isContract && claimsData.contract?.contractName && (
                <span className="font-medium">
                  {claimsData.contract.contractName}
                </span>
              )}
              <Web3Address
                address={entityAddress}
                size="small"
                copyToClipboard
                showBadge={!isContract || !claimsData.contract?.contractName}
                showPrettyName={false}
              />
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">
              {t("common:none")}
            </span>
          )}
        </DetailGridItem>

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
