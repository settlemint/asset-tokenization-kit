import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { PercentageProgressBar } from "@/components/blocks/percentage-progress/percentage-progress";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import { formatDate, formatDuration } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface CollateralProps {
  address: Address;
  assettype: AssetType;
}

export async function Collateral({ address, assettype }: CollateralProps) {
  const [asset, t, locale] = await Promise.all([
    assettype === "stablecoin"
      ? await getStableCoinDetail({ address })
      : assettype === "tokenizeddeposit"
        ? await getTokenizedDepositDetail({ address })
        : undefined,
    getTranslations("private.assets.fields"),
    getLocale(),
  ]);

  if (!asset) {
    return null;
  }

  return (
    <Suspense>
      <DetailGrid className="mt-4" title="Collateral">
        <DetailGridItem
          label={t("proven-collateral")}
          info={t("proven-collateral-info")}
        >
          {formatNumber(asset.collateral, {
            token: asset.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("required-collateral-threshold")}
          info={t("required-collateral-threshold-info")}
        >
          {formatNumber(100, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("committed-collateral-ratio")}
          info={t("committed-collateral-ratio-info")}
        >
          <PercentageProgressBar percentage={asset.collateralRatio} />
        </DetailGridItem>
        <DetailGridItem
          label={t("collateral-proof-expiration")}
          info={t("collateral-proof-expiration-info")}
        >
          {asset.collateralProofValidity
            ? formatDate(asset.collateralProofValidity, {
                type: "absolute",
                locale: locale,
              })
            : "-"}
        </DetailGridItem>
        <DetailGridItem
          label={t("collateral-proof-validity")}
          info={t("collateral-proof-validity-info")}
        >
          {formatDuration(asset.liveness)}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
