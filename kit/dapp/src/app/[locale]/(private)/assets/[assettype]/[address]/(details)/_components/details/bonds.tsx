import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getUser } from "@/lib/auth/utils";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getBondStatus } from "@/lib/utils/bond-status";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface BondsDetailsProps {
  address: Address;
  showBalance?: boolean;
  userAddress?: Address;
}

export async function BondsDetails({
  address,
  showBalance = false,
  userAddress,
}: BondsDetailsProps) {
  const user = await getUser();
  const [bond, t, locale] = await Promise.all([
    getBondDetail({ address, userCurrency: user.currency }),
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
      <DetailGridItem label={t("name")}>{bond.name}</DetailGridItem>
      <DetailGridItem label={t("symbol")}>{bond.symbol}</DetailGridItem>
      {bond.isin && (
        <DetailGridItem label={t("isin")}>{bond.isin}</DetailGridItem>
      )}
      <DetailGridItem label={t("contract-address")}>
        <EvmAddress
          address={bond.id}
          prettyNames={false}
          hoverCard={false}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("creator")}>
        <EvmAddress
          address={bond.creator.id}
          hoverCard={false}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("deployed-on")}>
        {formatDate(new Date(Number(bond.deployedOn) * 1000), {
          locale: locale,
          formatOptions: { dateStyle: "long" },
        })}
      </DetailGridItem>
      <DetailGridItem label={t("decimals")}>{bond.decimals}</DetailGridItem>
      <DetailGridItem label={t("max-supply")} info={t("max-supply-info")}>
        {formatNumber(bond.cap, {
          token: bond.symbol,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
        {formatNumber(bond.totalSupply, {
          token: bond.symbol,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      {/* Show balance only when requested and available */}
      {showBalance && balanceData && (
        <DetailGridItem label={t("balance")}>
          {formatNumber(balanceData.value, {
            token: bond.symbol,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
      )}
      <DetailGridItem label={t("redeemed")} info={t("redeemed-info")}>
        {bond.isMatured ? bond.redeemedAmount : t("not-available")}
      </DetailGridItem>
      <DetailGridItem label={t("maturity-status")}>
        {t(getBondStatus(bond))}
      </DetailGridItem>
      <DetailGridItem label={t("maturity-date")}>
        {bond.maturityDate
          ? formatDate(new Date(Number(bond.maturityDate) * 1000), {
              locale: locale,
              formatOptions: { dateStyle: "long" },
            })
          : "-"}
      </DetailGridItem>
      <DetailGridItem label={t("yield-type")}>
        {bond.yieldSchedule ? t("fixed") : t("not-available")}
      </DetailGridItem>
      <DetailGridItem label={t("face-value")}>{bond.faceValue}</DetailGridItem>
      <DetailGridItem label={t("underlying-asset")}>
        <EvmAddress
          address={bond.underlyingAsset.id}
          prettyNames={true}
          hoverCard={true}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("underlying-asset-balance")}>
        {formatNumber(bond.underlyingBalance, {
          token: bond.underlyingAsset.symbol,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("redemption-readiness")}>
        {/* Calculate percentage: (part/total) * 100
              Since we're using bigInt which doesn't support decimal division,
              we multiply the numerator by 100 before dividing to preserve precision */}
        {bond.totalUnderlyingNeededExact > 0
          ? Number(
              (bond.underlyingBalanceExact * 100n) /
                bond.totalUnderlyingNeededExact
            )
          : 0}
        %
      </DetailGridItem>
      <DetailGridItem
        label={t("ownership-concentration")}
        info={t("ownership-concentration-info")}
      >
        {formatNumber(bond.concentration, {
          percentage: true,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("price")} info={t("bonds-price")}>
        {formatNumber(bond.price.amount, {
          currency: bond.price.currency,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("total-value")}>
        {formatNumber(bond.price.amount * bond.totalSupply, {
          currency: bond.price.currency,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
    </DetailGrid>
  );
}
