import { ChartSkeleton } from "@/components/blocks/charts/chart-skeleton";
import { GaugeChart } from "@/components/blocks/charts/gauge-chart";
import { ChartColumnIncreasingIcon } from "@/components/ui/animated-icons/chart-column-increasing";
import { getBondYieldCoverage } from "@/lib/queries/bond/bond-yield-coverage";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface BondYieldCoverageProps {
  address: Address;
}

export async function BondYieldCoverage({ address }: BondYieldCoverageProps) {
  const t = await getTranslations("components.charts.assets");

  try {
    // Fetch yield coverage data
    const data = await getBondYieldCoverage({ address });

    // If no yield schedule exists, show no data message
    if (!data.hasYieldSchedule) {
      return (
        <ChartSkeleton title={t("yield-coverage.title")} variant="noData">
          <div className="flex flex-col items-center gap-2 text-center">
            <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
            <p>{t("yield-coverage.no-data")}</p>
          </div>
        </ChartSkeleton>
      );
    }

    // If yield schedule exists but isn't running, show not active message
    if (!data.isRunning) {
      return (
        <ChartSkeleton title={t("yield-coverage.title")} variant="noData">
          <div className="flex flex-col items-center gap-2 text-center">
            <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
            <p>{t("yield-coverage.no-data")}</p>
          </div>
        </ChartSkeleton>
      );
    }

    // Configure thresholds and colors for the gauge
    // - Red: <100% (not enough to cover unclaimed yield)
    // - Yellow: 100-199% (enough for current but not next yield period)
    // - Green: ≥200% (enough for current and next yield period)
    const thresholds = {
      medium: 100, // Yellow starts at 100%
      high: 200,   // Green starts at 200%
    };

    // Return the gauge chart with yield coverage data
    return (
      <GaugeChart
        title={t("yield-coverage.title")}
        value={data.yieldCoverage}
        max={100}
        thresholds={thresholds}
      />
    );
  } catch (error) {
    console.error("Error fetching yield coverage data:", error);

    // Return error state
    return (
      <ChartSkeleton title={t("yield-coverage.title")} variant="error">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartColumnIncreasingIcon className="h-8 w-8 text-muted-foreground" />
          <p>{t("yield-coverage.error")}</p>
        </div>
      </ChartSkeleton>
    );
  }
}