import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { formatNumber } from "@/lib/utils/number";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Address } from "viem";

interface DetailsProps {
  address: Address;
}

export async function Details({ address }: DetailsProps) {
  const bond = await getBondDetail({ address });
  const t = await getTranslations("admin.bonds.yield");

  return (
    <Suspense>
      <DetailGrid>
        <DetailGridItem label={t("type")}>
          {t("type-fixed")}
        </DetailGridItem>
        <DetailGridItem label={t("contract-address")}>
          <EvmAddress
            address={address}
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
          12/06/2024
        </DetailGridItem>
        <DetailGridItem label={t("rate")}>
          5%
        </DetailGridItem>
        <DetailGridItem label={t("start-date")}>
          01/01/2024
        </DetailGridItem>
        <DetailGridItem label={t("end-date")}>
          01/01/2029
        </DetailGridItem>
        <DetailGridItem label={t("interval")}>
          {t("yearly")}
        </DetailGridItem>
        <DetailGridItem label={t("periods")}>
          5
        </DetailGridItem>
        <DetailGridItem label={t("yield-per-period")}>
          5,000 USDC
        </DetailGridItem>
        <DetailGridItem label={t("total-yield-distributed")}>
          8,000 USDC
        </DetailGridItem>
        <DetailGridItem label={t("total-unclaimed-yield")}>
          2,000 USDC
        </DetailGridItem>
        <DetailGridItem label={t("underlying-asset-balance")}>
          2500 USDC
        </DetailGridItem>
        <DetailGridItem label={t("yield-coverage")}>
          {formatNumber(35, {
            percentage: true,
            decimals: 0,
          })}
        </DetailGridItem>
      </DetailGrid>
    </Suspense>
  );
}
