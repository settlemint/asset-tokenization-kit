import { BondExtensionDetails } from "@/components/asset-extensions/details/bond";
import { BondYieldCoverageChart } from "@/components/charts/bond-yield-coverage-chart";
import { AsyncBondYieldDistributionChart } from "@/components/charts/bond-yield-distribution-chart";
import { ChartSkeleton } from "@/components/charts/chart-skeleton";
import { DetailGrid } from "@/components/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/detail-grid/detail-grid-item";
import { DefaultCatchBoundary } from "@/components/error/default-catch-boundary";
import { PercentageProgressBar } from "@/components/percentage-progress/percentage-progress";
import { TokenRelatedActions } from "@/components/related/token-related-actions";
import { AssetBondStatusProgressChart } from "@/components/stats/charts/asset-bond-status-progress-chart";
import { AssetCollateralRatioChart } from "@/components/stats/charts/asset-collateral-ratio-chart";
import { AssetSupplyChangesAreaChart } from "@/components/stats/charts/asset-supply-changes-area-chart";
import { AssetTotalSupplyAreaChart } from "@/components/stats/charts/asset-total-supply-area-chart";
import { AssetTotalVolumeAreaChart } from "@/components/stats/charts/asset-total-volume-area-chart";
import { AssetWalletDistributionChart } from "@/components/stats/charts/asset-wallet-distribution-chart";
import { useTokenLoaderQuery } from "@/hooks/use-token-loader-query";
import { parseClaim } from "@/lib/utils/claims/parse-claim";
import { orpc } from "@/orpc/orpc-client";
import type { EquityCategory } from "@atk/zod/equity-categories";
import type { EquityClass } from "@atk/zod/equity-classes";
import type { FundCategory } from "@atk/zod/fund-categories";
import type { FundClass } from "@atk/zod/fund-classes";
import { useQuery } from "@tanstack/react-query";
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
  const { t } = useTranslation([
    "tokens",
    "assets",
    "common",
    "stats",
    "data-table",
  ]);
  const isinClaim = parseClaim<{ isin: string }>(
    asset.identity?.claims,
    "isin"
  );
  const basePriceClaim = parseClaim<{
    amount: string;
    currencyCode: string;
    decimals: string;
  }>(asset.identity?.claims, "basePrice");
  const assetClassificationClaim = parseClaim<{
    category: string;
    class: string;
  }>(asset.identity?.claims, "assetClassification");

  // Collateral ratio from ORPC stats API
  const { data: collateralStats } = useQuery(
    orpc.token.statsCollateralRatio.queryOptions({
      input: { tokenAddress: asset.id },
    })
  );
  const collateralRatio = collateralStats?.collateralRatio ?? 0;

  // Holders distribution and count
  const { data: walletDistribution } = useQuery(
    orpc.token.statsWalletDistribution.queryOptions({
      input: { tokenAddress: asset.id },
    })
  );
  const totalHolders =
    walletDistribution?.totalHolders ?? asset.stats?.balancesCount ?? 0;
  const topBucket = walletDistribution?.buckets?.[4]?.count ?? 0;
  const ownershipConcentration =
    totalHolders > 0 ? Math.round((topBucket / totalHolders) * 100) : 0;

  // Total burned (from supply changes history - last data point)
  const { data: supplyChanges } = useQuery(
    orpc.token.statsSupplyChanges.queryOptions({
      input: { tokenAddress: asset.id, days: 365 },
    })
  );
  const totalBurned =
    supplyChanges?.supplyChangesHistory?.at(-1)?.totalBurned ?? "0";

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
          label={t("tokens:fields.ownershipConcentration")}
          value={ownershipConcentration}
          type="percentage"
        />

        <DetailGridItem
          label={t("tokens:fields.totalBurned")}
          value={totalBurned}
          type="number"
        />

        <DetailGridItem
          label={t("tokens:fields.holdersCount")}
          value={totalHolders}
          type="number"
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
              value={asset.stats?.totalValueInBaseCurrency ?? from("0")}
              type="currency"
              currency={{ assetSymbol: basePriceClaim.currencyCode }}
            />
          </>
        )}

        {assetClassificationClaim && (
          <>
            <DetailGridItem
              label={t("tokens:fields.category")}
              info={t("tokens:fields.categoryInfo")}
              value={
                asset.type === "equity"
                  ? t(
                      `tokens:assetClassification.equity.categories.${assetClassificationClaim.category.toLowerCase() as Lowercase<EquityCategory>}`
                    )
                  : t(
                      `tokens:assetClassification.funds.categories.${assetClassificationClaim.category.toLowerCase() as Lowercase<FundCategory>}`
                    )
              }
              type="text"
            />
            <DetailGridItem
              label={t("tokens:fields.class")}
              info={t("tokens:fields.classInfo")}
              value={
                asset.type === "equity"
                  ? t(
                      `tokens:assetClassification.equity.classes.${assetClassificationClaim.class.toLowerCase() as Lowercase<EquityClass>}`
                    )
                  : t(
                      `tokens:assetClassification.funds.classes.${assetClassificationClaim.class.toLowerCase() as Lowercase<FundClass>}`
                    )
              }
              type="text"
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
          <DetailGridItem
            label={t("tokens:fields.committedCollateralRatio")}
            info={t("tokens:fields.committedCollateralRatioInfo")}
          >
            <PercentageProgressBar percentage={collateralRatio} />
          </DetailGridItem>
        </DetailGrid>
      )}

      {asset.bond && <BondExtensionDetails asset={asset} bond={asset.bond} />}

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
        <h2 className="text-xl font-medium text-accent">{t("stats:title")}</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {asset.bond && (
            <Suspense fallback={<ChartSkeleton />}>
              <AssetBondStatusProgressChart assetAddress={asset.id} />
            </Suspense>
          )}
          {asset.bond && (
            <Suspense fallback={<ChartSkeleton />}>
              <AsyncBondYieldDistributionChart
                assetAddress={asset.id}
                title={t("stats:charts.yieldDistribution.title")}
                description={t("stats:charts.yieldDistribution.description")}
              />
            </Suspense>
          )}
          {asset.bond && asset.extensions.includes("YIELD") && (
            <Suspense fallback={<ChartSkeleton />}>
              <BondYieldCoverageChart
                assetAddress={asset.id}
                title="Yield Coverage"
                description="Shows how well underlying assets cover yield payments"
              />
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
      <section className="space-y-4" style={{ display: "none" }}>
        <h2 className="text-xl font-medium text-accent">
          {t("tokens:related.title")}
        </h2>
        <TokenRelatedActions asset={asset} />
      </section>
    </>
  );
}
