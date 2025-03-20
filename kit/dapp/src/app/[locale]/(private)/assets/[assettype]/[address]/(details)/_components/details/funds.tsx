import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface FundsDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function FundsDetails({
  address,
  showBalance = false,
  userAddress
}: FundsDetailsProps) {
  const [fund, t, baseCurrency, locale] = await Promise.all([
    getFundDetail({ address }),
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
        <DetailGridItem label={t("name")}>{fund.name}</DetailGridItem>
        <DetailGridItem label={t("symbol")}>{fund.symbol}</DetailGridItem>
        {fund.isin && (
          <DetailGridItem label={t("isin")}>{fund.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={fund.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("creator")}>
          <EvmAddress
            address={fund.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("decimals")}>{fund.decimals}</DetailGridItem>
        <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
          {fund.totalSupply}
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
          {formatNumber(fund.concentration, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(fund.value_in_base_currency, {
            currency: baseCurrency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
