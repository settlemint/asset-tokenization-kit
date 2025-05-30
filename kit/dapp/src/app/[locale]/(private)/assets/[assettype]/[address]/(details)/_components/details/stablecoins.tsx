import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getUser } from "@/lib/auth/utils";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface StablecoinsDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function StablecoinsDetails({
  address,
  showBalance = false,
  userAddress,
}: StablecoinsDetailsProps) {
  const user = await getUser();
  const [stableCoin, t, locale] = await Promise.all([
    getStableCoinDetail({ address, userCurrency: user.currency }),
    getTranslations("private.assets.fields"),
    getLocale(),
  ]);

  // Conditionally fetch balance data only when needed
  const balanceData =
    showBalance && userAddress
      ? await getAssetBalanceDetail({ address, account: userAddress })
      : null;

  return (
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
      {/* Show balance only when requested and available */}
      {showBalance && balanceData && (
        <DetailGridItem label={t("balance")}>
          {formatNumber(balanceData.value, {
            token: stableCoin.symbol,
            locale: locale,
          })}
        </DetailGridItem>
      )}
      <DetailGridItem label={t("total-burned")} info={t("total-burned-info")}>
        {formatNumber(stableCoin.totalBurned, {
          token: stableCoin.symbol,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("total-holders")} info={t("total-holders-info")}>
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
        {formatNumber(stableCoin.price.amount, {
          currency: stableCoin.price.currency,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("total-value")}>
        {formatNumber(stableCoin.price.amount * stableCoin.totalSupply, {
          currency: stableCoin.price.currency,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
    </DetailGrid>
  );
}
