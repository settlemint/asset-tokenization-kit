import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface DepositsDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function DepositsDetails({
  address,
  showBalance = false,
  userAddress,
}: DepositsDetailsProps) {
  const [deposit, t, locale] = await Promise.all([
    getDepositDetail({ address }),
    getTranslations("private.assets.fields"),
    getLocale(),
  ]);

  // Conditionally fetch balance data only when needed
  const balanceData =
    showBalance && userAddress
      ? await getAssetBalanceDetail({ address, account: userAddress })
      : null;

  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t("name")}>{deposit.name}</DetailGridItem>
        <DetailGridItem label={t("symbol")}>{deposit.symbol}</DetailGridItem>
        {deposit.isin && (
          <DetailGridItem label={t("isin")}>{deposit.isin}</DetailGridItem>
        )}
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={deposit.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("creator")}>
          <EvmAddress
            address={deposit.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("decimals")}>
          {deposit.decimals}
        </DetailGridItem>
        <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
          {formatNumber(deposit.totalSupply, {
            token: deposit.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        {/* Show balance only when requested and available */}
        {showBalance && balanceData && (
          <DetailGridItem label={t("balance")}>
            {formatNumber(balanceData.value, {
              token: deposit.symbol,
              locale: locale,
            })}
          </DetailGridItem>
        )}
        <DetailGridItem label={t("total-burned")} info={t("total-burned-info")}>
          {formatNumber(deposit.totalBurned, {
            token: deposit.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("total-holders")}
          info={t("total-holders-info")}
        >
          {formatNumber(deposit.totalHolders, {
            decimals: 0,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(deposit.concentration, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(deposit.price.amount, {
            currency: deposit.price.currency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("total-value")}>
          {formatNumber(deposit.price.amount * deposit.totalSupply, {
            currency: deposit.price.currency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
