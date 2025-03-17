import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getSetting } from "@/lib/config/settings";
import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { formatNumber } from "@/lib/utils/number";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface FundsDetailsProps {
  address: Address;
}

export async function FundsDetails({ address }: FundsDetailsProps) {
  const fund = await getFundDetail({ address });
  const t = await getTranslations("private.assets.fields");
  const baseCurrency = await getSetting(SETTING_KEYS.BASE_CURRENCY);

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
        <DetailGridItem
          label={t("ownership-concentration")}
          info={t("ownership-concentration-info")}
        >
          {formatNumber(fund.concentration, {
            percentage: true,
            decimals: 2,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("price")}>
          {formatNumber(fund.value_in_base_currency, {
            currency: baseCurrency,
            decimals: 2,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
