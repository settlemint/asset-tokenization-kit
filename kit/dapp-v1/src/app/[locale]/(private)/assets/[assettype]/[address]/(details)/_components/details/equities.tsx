import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getUser } from "@/lib/auth/utils";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface EquitiesDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function EquitiesDetails({
  address,
  showBalance = false,
  userAddress,
}: EquitiesDetailsProps) {
  const user = await getUser();
  const [equity, t, locale] = await Promise.all([
    getEquityDetail({ address, userCurrency: user.currency }),
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
        {formatNumber(equity.totalSupply, {
          token: equity.symbol,
          locale: locale,
        })}
      </DetailGridItem>
      {/* Show balance only when requested and available */}
      {showBalance && balanceData && (
        <DetailGridItem label={t("balance")}>
          {formatNumber(balanceData.value, {
            token: equity.symbol,
            locale: locale,
          })}
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
        {formatNumber(equity.price.amount, {
          currency: equity.price.currency,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("total-value")}>
        {formatNumber(equity.price.amount * equity.totalSupply, {
          currency: equity.price.currency,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
    </DetailGrid>
  );
}
