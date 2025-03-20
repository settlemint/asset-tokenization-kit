import { DonutProgressChart } from "@/components/blocks/charts/donut-progress-chart";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getBondStatus } from "@/lib/utils/bond-status";
import { getBondStatusColor } from "@/lib/utils/chart-colors";
import { getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface BondStatusProgressProps {
  address: Address;
}

export async function BondStatusProgress({ address }: BondStatusProgressProps) {
  const t = await getTranslations("components.charts.assets");
  let bond;

  try {
    bond = await getBondDetail({ address });
  } catch (error) {
    console.error("Error fetching bond details:", error);
    // Return error state
    return (
      <DonutProgressChart
        title={t("bond-status-progress")}
        description={t("error-loading-data")}
        value={0}
        max={100}
        status="error"
        statusLabel={t("error-loading-data")}
        statusColor={getBondStatusColor("error")}
      />
    );
  }

  // Get bond status
  const status = getBondStatus(bond);

  // Determine what to display based on bond status
  switch (status) {
    case "issuing":
      // For issuance, show percentage of cap that has been issued
      const issued = Number(bond.totalSupply);
      const issuedMax = Number(bond.cap);

      return (
        <DonutProgressChart
          title={t("bond-issuance")}
          description={t("bond-issued")}
          value={issued}
          max={issuedMax}
          status="issuing"
          statusLabel={t("bond-issued")}
          statusColor={getBondStatusColor("issuing")}
        />
      );

    case "active":
      // For active bonds, show percentage of redemption readiness
      const redeemable = Number(bond.underlyingBalance);
      const redeemableMax = Number(bond.totalUnderlyingNeededExact);

      return (
        <DonutProgressChart
          title={t("bond-redemption-assets")}
          description={t("bond-redeemable")}
          value={redeemable}
          max={redeemableMax}
          status="redeemable"
          statusLabel={t("bond-redeemable")}
          statusColor={getBondStatusColor("redeemable")}
        />
      );

    case "matured":
      // For matured bonds, show percentage of bonds redeemed
      const redeemed = Number(bond.redeemedAmount);
      const redeemedMax = Number(bond.totalSupply);

      return (
        <DonutProgressChart
          title={t("bond-redeemed")}
          description={t("bond-matured")}
          value={redeemed}
          max={redeemedMax}
          status="redeemed"
          statusLabel={t("bond-redeemed")}
          statusColor={getBondStatusColor("redeemed")}
        />
      );

    default:
      // Fallback for unknown status
      return (
        <DonutProgressChart
          title={t("bond-status-progress")}
          description={`${t("bond-status")}: ${status}`}
          value={0}
          max={100}
          status="unknown"
          statusLabel={status}
          statusColor={getBondStatusColor("pending")}
        />
      );
  }
}