import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface StablecoinsDetailsProps {
  address: Address;
}

export async function StablecoinsDetails({ address }: StablecoinsDetailsProps) {
  const [stableCoin, t, baseCurrency, locale] = await Promise.all([
    getStableCoinDetail({ address }),
    getTranslations("private.assets.fields"),
    getSetting(SETTING_KEYS.BASE_CURRENCY),
    getLocale(),
  ]);

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
          {formatNumber(stableCoin.totalSupply, {
            token: stableCoin.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("total-burned")} info={t("total-burned-info")}>
          {formatNumber(stableCoin.totalBurned, {
            token: stableCoin.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("total-holders")}
          info={t("total-holders-info")}
        >
          {formatNumber(stableCoin.totalHolders, {
            decimals: 0,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(stableCoin.concentration, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(stableCoin.value_in_base_currency, {
            currency: baseCurrency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
