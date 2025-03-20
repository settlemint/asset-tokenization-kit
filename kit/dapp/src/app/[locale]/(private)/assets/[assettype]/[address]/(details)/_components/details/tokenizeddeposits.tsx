import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface TokenizedDepositsDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function TokenizedDepositsDetails({
  address,
  showBalance = false,
  userAddress,
}: TokenizedDepositsDetailsProps) {
  const [tokenizedDeposit, t, baseCurrency, locale] = await Promise.all([
    getTokenizedDepositDetail({ address }),
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
        <DetailGridItem label={t("name")}>
          {tokenizedDeposit.name}
        </DetailGridItem>
        <DetailGridItem label={t("symbol")}>
          {tokenizedDeposit.symbol}
        </DetailGridItem>
        {tokenizedDeposit.isin && (
          <DetailGridItem label={t("isin")}>
            {tokenizedDeposit.isin}
          </DetailGridItem>
        )}
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={tokenizedDeposit.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("creator")}>
          <EvmAddress
            address={tokenizedDeposit.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("decimals")}>
          {tokenizedDeposit.decimals}
        </DetailGridItem>
        <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
          {formatNumber(tokenizedDeposit.totalSupply, {
            token: tokenizedDeposit.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        {/* Show balance only when requested and available */}
        {showBalance && balanceData && (
          <DetailGridItem
            label={t("balance")}
          >
            {balanceData.value}
          </DetailGridItem>
        )}
        <DetailGridItem label={t("total-burned")} info={t("total-burned-info")}>
          {formatNumber(tokenizedDeposit.totalBurned, {
            token: tokenizedDeposit.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("total-holders")}
          info={t("total-holders-info")}
        >
          {formatNumber(tokenizedDeposit.totalHolders, {
            decimals: 0,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(tokenizedDeposit.concentration, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(tokenizedDeposit.value_in_base_currency, {
            currency: baseCurrency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
