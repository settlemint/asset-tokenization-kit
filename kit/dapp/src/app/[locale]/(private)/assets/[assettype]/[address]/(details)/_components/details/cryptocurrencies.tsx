import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface CryptocurrenciesDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function CryptocurrenciesDetails({
  address,
  showBalance = false,
  userAddress,
}: CryptocurrenciesDetailsProps) {
  const [cryptocurrency, t, locale] = await Promise.all([
    getCryptoCurrencyDetail({ address }),
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
        <DetailGridItem label={t("name")}>{cryptocurrency.name}</DetailGridItem>
        <DetailGridItem label={t("symbol")}>
          {cryptocurrency.symbol}
        </DetailGridItem>
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={cryptocurrency.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("creator")}>
          <EvmAddress
            address={cryptocurrency.creator.id}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("decimals")}>
          {cryptocurrency.decimals}
        </DetailGridItem>
        <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
          {formatNumber(cryptocurrency.totalSupply, {
            token: cryptocurrency.symbol,
            locale: locale,
          })}
        </DetailGridItem>
        {/* Show balance only when requested and available */}
        {showBalance && balanceData && (
          <DetailGridItem label={t("balance")}>
            {formatNumber(balanceData.value, {
              token: cryptocurrency.symbol,
              locale: locale,
            })}
          </DetailGridItem>
        )}
        <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(cryptocurrency.concentration, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(cryptocurrency.price.amount, {
            currency: cryptocurrency.price.currency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("total-value")}>
          {formatNumber(
            cryptocurrency.price.amount * cryptocurrency.totalSupply,
            {
              currency: cryptocurrency.price.currency,
              decimals: 2,
              locale: locale,
            }
          )}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
