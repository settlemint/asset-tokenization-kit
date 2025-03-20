import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface EquitiesDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function EquitiesDetails({
  address,
  showBalance = false,
  userAddress
}: EquitiesDetailsProps) {
  const [equity, t, baseCurrency, locale] = await Promise.all([
    getEquityDetail({ address }),
    getTranslations("private.assets.fields"),
    getSetting(SETTING_KEYS.BASE_CURRENCY),
    getLocale(),
  ]);

  // Conditionally fetch balance data only when needed
  const balanceData = showBalance && userAddress
    ? await getAssetBalanceDetail({ address, account: userAddress })
    : null;

  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t("name")}>{equity.name}</DetailGridItem>
        <DetailGridItem label={t("symbol")}>{equity.symbol}</DetailGridItem>
        {equity.isin && (
          <DetailGridItem label={t("isin")}>{equity.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={equity.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("creator")}>
          <EvmAddress
            address={equity.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("decimals")}>{equity.decimals}</DetailGridItem>
        <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
          {equity.totalSupply}
        </DetailGridItem>
        {/* Show balance only when requested and available */}
        {showBalance && balanceData && (
          <DetailGridItem
            label={t("balance")}
          >
            {balanceData.value}
          </DetailGridItem>
        )}
        <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(equity.concentration, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(equity.value_in_base_currency, {
            currency: baseCurrency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
