import { DonutProgressChart } from "@/components/blocks/charts/donut-progress-chart";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getBondStatusColor } from "@/lib/utils/chart-colors";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface BondMatureReadinessProps {
  address: Address;
}

export async function BondMatureReadiness({ address }: BondMatureReadinessProps) {
  const t = await getTranslations("components.charts.assets");
  let bond;

  try {
    bond = await getBondDetail({ address });
  } catch (error) {
    console.error("Error fetching bond details:", error);
    // Return error state
    return (
      <DonutProgressChart
        title={t("bond-mature-readiness")}
        description={t("error-loading-data")}
        value={0}
        max={100}
        status="error"
        statusLabel={t("error-loading-data")}
        statusColor={getBondStatusColor("error")}
      />
    );
  }

  const redeemable = Number(bond.underlyingBalance);
  const redeemableMax = Number(bond.totalUnderlyingNeededExact);

  return (
    <DonutProgressChart
      title={t("bond-mature-readiness")}
      description={t("bond-mature-readiness-description")}
      value={redeemable}
      max={redeemableMax}
      status="redeemable"
      statusLabel={t("bond-mature-readiness-status")}
      statusColor={getBondStatusColor("redeemable")}
    />
  );
}