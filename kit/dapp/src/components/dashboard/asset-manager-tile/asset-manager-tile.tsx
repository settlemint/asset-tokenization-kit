import { AssetDesignerDialog } from "@/components/asset-designer/asset-designer-wizard/asset-designer-dialog";
import { ASSET_COLORS } from "@/components/assets/asset-colors";
import { PercentageChange } from "@/components/stats/percentage-change";
import { StatList } from "@/components/stats/stat-list";
import {
  Tile,
  TileBadge,
  TileContent,
  TileDescription,
  TileFooter,
  TileFooterAction,
  TileHeader,
  TileHeaderContent,
  TileIcon,
  TileTitle,
} from "@/components/tile/tile";
import { type ChartConfig } from "@/components/ui/chart";
import { DEFAULT_SETTINGS } from "@/lib/db/schemas/settings.constants";
import { formatValue } from "@/lib/utils/format-value";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toNumber } from "dnum";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AssetBreakdownDonut } from "./asset-breakdown-donut";

/**
 * Asset portfolio overview showing AUM, type breakdown, and launch status.
 *
 * Separates BASE_CURRENCY from stats queries to optimize cache invalidation—
 * currency settings rarely change while market stats update frequently.
 */
export function AssetManagerTile() {
  const { t } = useTranslation("dashboard");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: stats } = useSuspenseQuery(
    orpc.system.stats.assets.queryOptions({
      input: {},
    })
  );

  const { data: baseCurrency } = useSuspenseQuery(
    orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
  );

  const { data: valueHistory } = useSuspenseQuery(
    orpc.system.stats.systemValueHistoryByPreset.queryOptions({
      input: { preset: "trailing7Days" },
    })
  );

  // Extract first and last data points to calculate 7-day AUM growth percentage
  const firstValue = valueHistory.data.at(0)?.totalValueInBaseCurrency ?? 0;
  const lastValue = valueHistory.data.at(-1)?.totalValueInBaseCurrency ?? 0;

  const hasPending = stats.pendingLaunchesCount > 0;

  // Exclude zero-value types to prevent visual clutter in donut chart
  const chartData = useMemo(() => {
    return Object.entries(stats.valueBreakdown)
      .map(([assetType, value]) => ({
        assetType,
        value: toNumber(value),
      }))
      .filter((item) => item.value > 0);
  }, [stats.valueBreakdown]);

  const chartConfig = {
    bond: { label: t("assetManagerCard.chart.bond"), color: ASSET_COLORS.bond },
    equity: {
      label: t("assetManagerCard.chart.equity"),
      color: ASSET_COLORS.equity,
    },
    fund: { label: t("assetManagerCard.chart.fund"), color: ASSET_COLORS.fund },
    stablecoin: {
      label: t("assetManagerCard.chart.stablecoin"),
      color: ASSET_COLORS.stablecoin,
    },
    deposit: {
      label: t("assetManagerCard.chart.deposit"),
      color: ASSET_COLORS.deposit,
    },
  } satisfies ChartConfig;

  return (
    <>
      <AssetDesignerDialog open={modalOpen} onOpenChange={setModalOpen} />

      <Tile>
        <TileHeader>
          <TileIcon icon={Briefcase} color="chart-3" />
          <TileHeaderContent>
            <TileTitle>{t("assetManagerCard.title")}</TileTitle>
          </TileHeaderContent>
          <TileBadge
            variant={hasPending ? "warning" : "success"}
            className="gap-1.5"
          >
            {hasPending ? (
              t(
                stats.pendingLaunchesCount === 1
                  ? "assetManagerCard.badge.pendingLaunchesSingular"
                  : "assetManagerCard.badge.pendingLaunchesPlural",
                {
                  count: stats.pendingLaunchesCount,
                }
              )
            ) : (
              <>
                <CheckCircle2 className="size-3" aria-hidden="true" />
                {t("assetManagerCard.badge.allLaunched")}
              </>
            )}
          </TileBadge>
        </TileHeader>

        <TileContent>
          <TileDescription>{t("assetManagerCard.description")}</TileDescription>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-sm text-muted-foreground">
                {t("assetManagerCard.stats.aum")}
              </span>
              <div className="space-y-2">
                <div className="text-3xl font-bold tabular-nums">
                  {formatValue(stats.totalValue, {
                    type: "currency",
                    currency: {
                      assetSymbol:
                        baseCurrency ?? DEFAULT_SETTINGS.BASE_CURRENCY,
                    },
                    compact: true,
                  })}
                </div>
                <PercentageChange
                  previousValue={firstValue}
                  currentValue={lastValue}
                  period="trailing7Days"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <AssetBreakdownDonut data={chartData} config={chartConfig} />
            </div>
          </div>
          <StatList
            items={[
              {
                text: t("assetManagerCard.stats.active", {
                  count: stats.tokensLaunchedCount,
                }),
                variant: "foreground",
              },
              {
                text: t(
                  stats.pendingLaunchesCount === 1
                    ? "assetManagerCard.stats.pendingLaunchesSingular"
                    : "assetManagerCard.stats.pendingLaunchesPlural",
                  {
                    count: stats.pendingLaunchesCount,
                  }
                ),
                variant: hasPending ? "warning" : "foreground",
              },
            ]}
          />
        </TileContent>

        <TileFooter>
          <TileFooterAction
            onClick={() => {
              setModalOpen(true);
            }}
            variant="outline"
            className="w-full"
          >
            {t("assetManagerCard.cta")}
          </TileFooterAction>
        </TileFooter>
      </Tile>
    </>
  );
}
