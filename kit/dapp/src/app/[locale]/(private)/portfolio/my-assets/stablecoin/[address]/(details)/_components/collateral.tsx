import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { PercentageProgressBar } from "@/components/blocks/percentage-progress/percentage-progress";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { formatDate, formatDuration } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface CollateralProps {
  address: Address;
}

export async function Collateral({ address }: CollateralProps) {
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations("admin.stablecoins.collateral");

  return (
    <Suspense>
      <DetailGrid className="mt-4" title="Collateral">
        <DetailGridItem
          label={t("proven-collateral")}
          info={t("proven-collateral-info")}
        >
          {formatNumber(stableCoin.collateral, { token: stableCoin.symbol })}
        </DetailGridItem>
        <DetailGridItem
          label={t("required-collateral-threshold")}
          info={t("required-collateral-threshold-info")}
        >
          {formatNumber(100, { percentage: true, decimals: 2 })}
        </DetailGridItem>
        <DetailGridItem
          label={t("committed-collateral-ratio")}
          info={t("committed-collateral-ratio-info")}
        >
          <PercentageProgressBar percentage={stableCoin.collateralRatio} />
        </DetailGridItem>
        <DetailGridItem
          label={t("collateral-proof-expiration")}
          info={t("collateral-proof-expiration-info")}
        >
          {stableCoin.collateralProofValidity
            ? formatDate(stableCoin.collateralProofValidity, {
                type: "absolute",
              })
            : "-"}
        </DetailGridItem>
        <DetailGridItem
          label={t("collateral-proof-validity")}
          info={t("collateral-proof-validity-info")}
        >
          {formatDuration(stableCoin.liveness)}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
