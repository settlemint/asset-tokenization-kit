import { ProgressChart } from "@/components/blocks/charts/progress-chart";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getBondStatus } from "@/lib/utils/bond-status";
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
    // Even in error case, explicitly return a chart with meaningful information
    return (
      <ProgressChart
        title={t("bond-status-progress")}
        description={t("error-loading-data")}
        value={0}
        max={100}
      />
    );
  }

  // Handle each status explicitly
  const status = getBondStatus(bond);

  switch (status) {
    case "issuing":
      // Handle issuance status
      return (
        <ProgressChart
          title={t("bond-issuance")}
          value={Number(bond.totalSupply)}
          max={Number(bond.cap)}
        />
      );

    case "active":
      // TODO: redemption readiness
      return (
        <ProgressChart
          title={t("bond-redemption-assets")}
          value={70}
          max={100}
        />
      );

    case "matured":
      return (
        <ProgressChart
          title={t("bond-redeemed")}
          value={70}
          max={100}
        />
      );

    default:
      // Handle unknown or undefined status - still a specific case, not a fallback
      return (
        <ProgressChart
          title={t("bond-status-progress")}
          description={`${t("bond-status")}: ${status}`}
          value={0}
          max={100}
        />
      );
  }
}