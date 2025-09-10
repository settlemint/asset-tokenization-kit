import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { AssetBondStatusProgressChart } from "@/components/stats/charts/asset-bond-status-progress-chart";
import { AssetCollateralRatioChart } from "@/components/stats/charts/asset-collateral-ratio-chart";
import { AssetSupplyChangesAreaChart } from "@/components/stats/charts/asset-supply-changes-area-chart";
import { AssetTotalSupplyAreaChart } from "@/components/stats/charts/asset-total-supply-area-chart";
import { AssetTotalVolumeAreaChart } from "@/components/stats/charts/asset-total-volume-area-chart";
import { AssetWalletDistributionChart } from "@/components/stats/charts/asset-wallet-distribution-chart";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { parseClaim } from "@/lib/utils/claims/parse-claim";
import { createFileRoute } from "@tanstack/react-router";
import { from } from "dnum";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";

/**
 * Route configuration for individual asset details page
 *
 * This route displays detailed information about a specific asset
 * created by a asset factory. The route is authenticated and requires
 * the user to be onboarded.
 *
 * Route path: `/asset/{factoryAddress}/{assetAddress}`
 *
 * @remarks
 * - Both factoryAddress and assetAddress must be valid Ethereum addresses
 * - This route is nested under the factory route for hierarchical navigation
 * - Currently displays a placeholder - implementation pending
 *
 * @example
 * ```
 * // Navigating to this route
 * navigate({
 *   to: '/asset/$factoryAddress/$assetAddress',
 *   params: {
 *     factoryAddress: '0x1234...',
 *     assetAddress: '0x5678...'
 *   }
 * });
 * ```
 *
 * @todo Implement the following features:
 * - Load asset details from the API
 * - Display asset metadata (name, symbol, supply, etc.)
 * - Show user permissions and roles for this asset
 * - Add asset operations (transfer, mint, burn) based on permissions
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
 * expanded to show comprehensive asset information including:
 * - Token metadata and configuration
 * - User permissions and available operations
 * - Transaction history and holders
 * - Compliance and regulatory status
 *
 * @returns Placeholder component for asset details page
 *
 * @todo Replace placeholder with actual implementation:
 * ```tsx
 * function RouteComponent() {
 *   const { factoryAddress, assetAddress } = Route.useParams();
 *   const { data: asset } = useQuery(
 *     orpc.asset.read.queryOptions({
 *       input: { id: assetAddress }
 *     })
 *   );
 *
 *   return (
 *     <div className="space-y-6 p-6">
 *       <TokenHeader asset={asset} />
 *       <TokenMetrics asset={asset} />
 *       <TokenOperations asset={asset} />
 *       <TokenTransactionHistory assetAddress={assetAddress} />
 *     </div>
 *   );
 * }
 * ```
 */

function RouteComponent() {
  const { asset } = useTokenLoaderQuery();
  const { t } = useTranslation(["tokens", "assets", "common", "stats"]);
  const isinClaim = parseClaim<{ isin: string }>(
    asset.account.identity?.claims,
    "isin"
  );
  const basePriceClaim = parseClaim<{
    amount: string;
    currencyCode: string;
    decimals: string;
  }>(asset.account.identity?.claims, "basePrice");

  return (
    <>
      <DetailGrid>
        <DetailGridItem
          label={t("tokens:fields.contractAddress")}
          info={t("tokens:fields.contractAddressInfo")}
          value={asset.id}
          type="address"
          showPrettyName={false}
        />

        <DetailGridItem
          label={t("tokens:fields.name")}
          info={t("tokens:fields.nameInfo")}
          value={asset.name}
          type="text"
        />

        <DetailGridItem
          label={t("tokens:fields.symbol")}
          info={t("tokens:fields.symbolInfo")}
          value={asset.symbol}
          type="text"
        />

        <DetailGridItem
          label={t("tokens:fields.decimals")}
          info={t("tokens:fields.decimalsInfo")}
          value={asset.decimals}
          type="number"
        />

        <DetailGridItem
          label={t("tokens:fields.totalSupply")}
          info={t("tokens:fields.totalSupplyInfo")}
          value={asset.totalSupply}
          type="currency"
          currency={{ assetSymbol: asset.symbol }}
        />

        <DetailGridItem
          label={t("tokens:fields.createdBy")}
          info={t("tokens:fields.createdByInfo")}
          value={asset.createdBy.id}
          type="address"
        />

        {isinClaim && (
          <DetailGridItem
            label={t("tokens:fields.isin")}
            info={t("tokens:fields.isinInfo")}
            value={isinClaim.isin}
            type="text"
          />
        )}

        {basePriceClaim && (
          <>
            <DetailGridItem
              label={t("tokens:fields.basePrice")}
              info={t("tokens:fields.basePriceInfo")}
              value={from([
                BigInt(basePriceClaim.amount),
                Number(basePriceClaim.decimals),
              ])}
              type="currency"
              currency={{ assetSymbol: basePriceClaim.currencyCode }}
            />
            <DetailGridItem
              label={t("tokens:fields.totalPrice")}
              info={t("tokens:fields.totalPriceInfo")}
              value={from(
                asset.stats?.totalValueInBaseCurrency ?? "0",
                Number(basePriceClaim.decimals)
              )}
              type="currency"
              currency={{ assetSymbol: basePriceClaim.currencyCode }}
            />
          </>
        )}

        {asset.capped?.cap && (
          <DetailGridItem
            label={t("tokens:fields.cap")}
            info={t("tokens:fields.capInfo")}
            value={asset.capped.cap}
            type="currency"
            currency={{ assetSymbol: asset.symbol }}
          />
        )}

        {asset.redeemable?.redeemedAmount && (
          <DetailGridItem
            label={t("tokens:fields.redeemedAmount")}
            info={t("tokens:fields.redeemedAmountInfo")}
            value={asset.redeemable.redeemedAmount}
            type="currency"
            currency={{ assetSymbol: asset.symbol }}
          />
        )}
      </DetailGrid>

      {asset.collateral && (
        <DetailGrid title={t("tokens:details.collateralInformation")}>
          <DetailGridItem
            label={t("tokens:fields.collateral")}
            info={t("tokens:fields.collateralInfo")}
            value={asset.collateral.collateral}
            type="currency"
            currency={{ assetSymbol: asset.symbol }}
          />
          <DetailGridItem
            label={t("tokens:fields.collateralExpiry")}
            info={t("tokens:fields.collateralExpiryInfo")}
            value={asset.collateral.expiryTimestamp}
            type="date"
            emptyValue={t("tokens:fields.noExpiry")}
          />
        </DetailGrid>
      )}

      {asset.bond && (
        <DetailGrid title={t("tokens:details.bondInformation")}>
          <DetailGridItem
            label={t("tokens:fields.faceValue")}
            info={t("tokens:fields.faceValueInfo")}
            value={asset.bond.faceValue}
            type="currency"
            currency={{ assetSymbol: asset.bond.denominationAsset.symbol }}
          />
          <DetailGridItem
            label={t("tokens:fields.isMatured")}
            info={t("tokens:fields.isMaturedInfo")}
            value={asset.bond.isMatured}
            type="boolean"
          />
          <DetailGridItem
            label={t("tokens:fields.maturityDate")}
            info={t("tokens:fields.maturityDateInfo")}
            value={asset.bond.maturityDate}
            type="date"
            emptyValue={t("tokens:fields.noExpiry")}
          />
        </DetailGrid>
      )}

      {asset.fund && (
        <DetailGrid title={t("tokens:details.fundInformation")}>
          <DetailGridItem
            label={t("tokens:fields.managementFeeBps")}
            info={t("tokens:fields.managementFeeBpsInfo")}
            value={asset.fund.managementFeeBps}
            type="percentage"
          />
        </DetailGrid>
      )}

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("stats:title")}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {asset.bond && (
            <Suspense fallback={<ChartSkeleton />}>
              <AssetBondStatusProgressChart assetAddress={asset.id} />
            </Suspense>
          )}
          {asset.collateral && (
            <Suspense fallback={<ChartSkeleton />}>
              <AssetCollateralRatioChart assetAddress={asset.id} />
            </Suspense>
          )}
          <Suspense fallback={<ChartSkeleton />}>
            <AssetTotalSupplyAreaChart assetAddress={asset.id} timeRange={30} />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <AssetSupplyChangesAreaChart
              assetAddress={asset.id}
              timeRange={30}
            />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <AssetTotalVolumeAreaChart assetAddress={asset.id} timeRange={30} />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <AssetWalletDistributionChart assetAddress={asset.id} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
