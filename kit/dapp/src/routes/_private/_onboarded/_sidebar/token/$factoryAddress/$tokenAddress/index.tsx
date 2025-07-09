import { DetailGrid, DetailGridItem } from "@/components/detail-grid";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { Web3Address } from "@/components/web3/web3-address";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { format } from "dnum";
import { useTranslation } from "react-i18next";

/**
 * Route configuration for individual token details page
 *
 * This route displays detailed information about a specific token
 * created by a token factory. The route is authenticated and requires
 * the user to be onboarded.
 *
 * Route path: `/token/{factoryAddress}/{tokenAddress}`
 *
 * @remarks
 * - Both factoryAddress and tokenAddress must be valid Ethereum addresses
 * - This route is nested under the factory route for hierarchical navigation
 * - Currently displays a placeholder - implementation pending
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/token/$factoryAddress/$tokenAddress',
 *   params: {
 *     factoryAddress: '0x1234...',
 *     tokenAddress: '0x5678...'
 *   }
 * });
 * ```
 *
 * @todo Implement the following features:
 * - Load token details from the API
 * - Display token metadata (name, symbol, supply, etc.)
 * - Show user permissions and roles for this token
 * - Add token operations (transfer, mint, burn) based on permissions
 * - Include transaction history
 * - Display compliance and regulatory information
 */
export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress/"
)({
  errorComponent: DefaultCatchBoundary,
  component: RouteComponent,
});

/**
 * Token details page component (placeholder)
 *
 * Currently displays a placeholder message. This component will be
 * expanded to show comprehensive token information including:
 * - Token metadata and configuration
 * - User permissions and available operations
 * - Transaction history and holders
 * - Compliance and regulatory status
 *
 * @returns Placeholder component for token details page
 *
 * @todo Replace placeholder with actual implementation:
 * ```tsx
 * function RouteComponent() {
 *   const { factoryAddress, tokenAddress } = Route.useParams();
 *   const { data: token } = useQuery(
 *     orpc.token.read.queryOptions({
 *       input: { id: tokenAddress }
 *     })
 *   );
 *
 *   return (
 *     <div className="space-y-6 p-6">
 *       <TokenHeader token={token} />
 *       <TokenMetrics token={token} />
 *       <TokenOperations token={token} />
 *       <TokenTransactionHistory tokenAddress={tokenAddress} />
 *     </div>
 *   );
 * }
 * ```
 */

function RouteComponent() {
  const { token } = useLoaderData({
    from: "/_private/_onboarded/_sidebar/token/$factoryAddress/$tokenAddress",
  });
  const { t } = useTranslation(["tokens", "assets", "common"]);

  return (
    <>
      <DetailGrid>
        <DetailGridItem
          label={t("tokens:fields.contractAddress")}
          info={t("tokens:fields.contractAddressInfo")}
        >
          <Web3Address
            address={token.id}
            copyToClipboard={true}
            showFullAddress={false}
            size="tiny"
            showSymbol={false}
            showBadge={false}
            showPrettyName={false}
          />
        </DetailGridItem>

        <DetailGridItem
          label={t("tokens:fields.name")}
          info={t("tokens:fields.nameInfo")}
        >
          {token.name}
        </DetailGridItem>

        <DetailGridItem
          label={t("tokens:fields.symbol")}
          info={t("tokens:fields.symbolInfo")}
        >
          {token.symbol}
        </DetailGridItem>

        <DetailGridItem
          label={t("tokens:fields.decimals")}
          info={t("tokens:fields.decimalsInfo")}
        >
          {token.decimals}
        </DetailGridItem>

        <DetailGridItem
          label={t("tokens:fields.totalSupply")}
          info={t("tokens:fields.totalSupplyInfo")}
        >
          {format(token.totalSupply, { compact: true, digits: 2 })}{" "}
          {token.symbol}
        </DetailGridItem>
      </DetailGrid>

      {/* Compliance Information */}
      <DetailGrid title={t("tokens:details.complianceInformation")}>
        <DetailGridItem
          label={t("tokens:fields.requiredClaims")}
          info={t("tokens:fields.requiredClaimsInfo")}
        >
          <span className="text-muted-foreground">
            {t("tokens:fields.noRequiredClaims")}
          </span>
        </DetailGridItem>
      </DetailGrid>
    </>
  );
}
