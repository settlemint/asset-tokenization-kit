import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { formatNumber } from "@/lib/utils/number";
import { format } from "date-fns";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface BondsDetailsProps {
  address: Address;
}

export async function BondsDetails({ address }: BondsDetailsProps) {
  const [baseCurrency, bond, t, locale] = await Promise.all([
    getSetting(SETTING_KEYS.BASE_CURRENCY),
    getBondDetail({ address }),
    getTranslations("private.assets.fields"),
    getLocale(),
  ]);

  return (
    <Suspense>
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
          {format(new Date(Number(bond.deployedOn) * 1000), "PPP")}
        </DetailGridItem>
        <DetailGridItem label={t("decimals")}>{bond.decimals}</DetailGridItem>
        <DetailGridItem label={t("total-supply")} info={t("total-supply-info")}>
          {bond.cap}
        </DetailGridItem>
        <DetailGridItem label={t("total-issued")} info={t("total-issued-info")}>
          {bond.totalSupply}
        </DetailGridItem>
        <DetailGridItem label={t("redeemed")} info={t("redeemed-info")}>
          {bond.isMatured ? bond.redeemedAmount : t("not-available")}
        </DetailGridItem>
        <DetailGridItem label={t("maturity-status")}>
          {bond.isMatured
            ? t("matured")
            : bond.totalSupply < bond.cap
              ? t("issuing")
              : t("active")}
        </DetailGridItem>
        <DetailGridItem label={t("maturity-date")}>
          {bond.maturityDate
            ? format(new Date(Number(bond.maturityDate) * 1000), "PPP")
            : "-"}
        </DetailGridItem>
        <DetailGridItem label={t("yield-type")}>Fixed</DetailGridItem>
        <DetailGridItem label={t("face-value")}>
          {bond.faceValue}
        </DetailGridItem>
        <DetailGridItem label={t("underlying-asset")}>
          <EvmAddress
            address={bond.underlyingAsset}
            prettyNames={true}
            hoverCard={true}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("underlying-asset-balance")}>
          {bond.underlyingBalance}
        </DetailGridItem>
        <DetailGridItem label={t("redemption-readiness")}>
          {/* Calculate percentage: (part/total) * 100
              Since we're using bigInt which doesn't support decimal division,
              we multiply the numerator by 100 before dividing to preserve precision */}
          {bond.totalUnderlyingNeededExact > 0
            ? (bond.underlyingBalance * 100n) / bond.totalUnderlyingNeededExact
            : 0}
          %
        </DetailGridItem>
        <DetailGridItem label={t("ownership-concentration")}>
          {formatNumber(bond.concentration, {
            percentage: true,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(bond.value_in_base_currency, {
            currency: baseCurrency,
            decimals: 2,
            locale: locale,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
