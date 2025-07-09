import { DetailGrid, DetailGridItem } from "@/components/detail-grid";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
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
          value={token.id}
          type="address"
          showPrettyName={false}
        />

        <DetailGridItem
          label={t("tokens:fields.name")}
          info={t("tokens:fields.nameInfo")}
          value={token.name}
          type="text"
        />

        <DetailGridItem
          label={t("tokens:fields.symbol")}
          info={t("tokens:fields.symbolInfo")}
          value={token.symbol}
          type="text"
        />

        <DetailGridItem
          label={t("tokens:fields.decimals")}
          info={t("tokens:fields.decimalsInfo")}
          value={token.decimals}
          type="number"
        />

        <DetailGridItem
          label={t("tokens:fields.totalSupply")}
          info={t("tokens:fields.totalSupplyInfo")}
          value={token.totalSupply}
          type="currency"
          currency={token.symbol}
        />
      </DetailGrid>

      {token.collateral && (
        <DetailGrid title={t("tokens:details.collateralInformation")}>
          <DetailGridItem
            label={t("tokens:fields.collateral")}
            info={t("tokens:fields.collateralInfo")}
            value={token.collateral.collateral}
            type="currency"
            currency={token.symbol}
          />
          <DetailGridItem
            label={t("tokens:fields.collateralExpiry")}
            info={t("tokens:fields.collateralExpiryInfo")}
            value={token.collateral.expiryTimestamp}
            type="date"
            emptyValue={t("tokens:fields.noExpiry")}
          />
        </DetailGrid>
      )}
    </>
  );
}
