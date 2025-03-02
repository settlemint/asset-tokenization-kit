import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { formatNumber } from "@/lib/utils/number";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface DetailsProps {
  address: Address;
}

export async function Details({ address }: DetailsProps) {
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations("admin.stablecoins.details");
  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t("name")}>{stableCoin.name}</DetailGridItem>
        <DetailGridItem label={t("symbol")}>{stableCoin.symbol}</DetailGridItem>
        {stableCoin.isin && (
          <DetailGridItem label={t("isin")}>{stableCoin.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={stableCoin.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("creator")}>
          <EvmAddress
            address={stableCoin.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("decimals")}>
          {stableCoin.decimals}
        </DetailGridItem>
        <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
          {stableCoin.totalSupply}
        </DetailGridItem>
        <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(stableCoin.concentration, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
