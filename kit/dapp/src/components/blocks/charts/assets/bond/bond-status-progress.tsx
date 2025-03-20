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

  // Compute chart parameters based on status
  let chartProps;

  switch (status) {
    case "issuing":
      // For issuance, show percentage of cap that has been issued
      chartProps = {
        title: t("bond-issuance"),
        description: t("bond-issued"),
        value: Number(bond.totalSupply),
        max: Number(bond.cap),
        status: "issuing" as const,
        statusLabel: t("bond-issued"),
        statusColor: getBondStatusColor("issuing"),
      };
      break;

    case "active":
      // For active bonds, show percentage of redemption readiness
      chartProps = {
        title: t("bond-redemption-assets"),
        description: t("bond-redeemable"),
        value: Number(bond.underlyingBalance),
        max: Number(bond.totalUnderlyingNeededExact),
        status: "redeemable" as const,
        statusLabel: t("bond-redeemable"),
        statusColor: getBondStatusColor("redeemable"),
      };
      break;

    case "matured":
      // For matured bonds, show percentage of bonds redeemed
      chartProps = {
        title: t("bond-redeemed"),
        description: t("bond-matured"),
        value: Number(bond.redeemedAmount),
        max: Number(bond.totalSupply),
        status: "redeemed" as const,
        statusLabel: t("bond-redeemed"),
        statusColor: getBondStatusColor("redeemed"),
      };
      break;

    default:
      // Fallback for unknown status
      chartProps = {
        title: t("bond-status-progress"),
        description: `${t("bond-status")}: ${status}`,
        value: 0,
        max: 100,
        status: "unknown" as const,
        statusLabel: status,
        statusColor: getBondStatusColor("pending"),
      };
      break;
  }

  return <DonutProgressChart {...chartProps} />;
}