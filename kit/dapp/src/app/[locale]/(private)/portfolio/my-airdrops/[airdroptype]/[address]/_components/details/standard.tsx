"use client";

import { AirdropStatusIndicator } from "@/components/blocks/airdrop-claim-status/airdrop-claim-status";
import { DataTable } from "@/components/blocks/data-table/data-table";
import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { authClient } from "@/lib/auth/client";
import type { UserStandardAirdrop } from "@/lib/queries/standard-airdrop/standard-airdrop-schema";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { Columns } from "./standard-allocation-columns";

export function StandardAirdropDetails({
  airdrop,
}: {
  airdrop: UserStandardAirdrop;
}) {
  const t = useTranslations("private.airdrops.details");
  const locale = useLocale();
  const session = authClient.useSession();

  return (
    <>
      <DetailGrid>
        <DetailGridItem label={t("fields.contract-address")}>
          <EvmAddress
            address={airdrop.id}
            prettyNames={false}
            hoverCard={false}
            copyToClipboard={true}
          />
        </DetailGridItem>
        <DetailGridItem label={t("fields.type")}>
          {t("fields.type-standard")}
        </DetailGridItem>
        <DetailGridItem label={t("fields.asset")}>
          <EvmAddress
            address={airdrop.asset.id}
            prettyNames={true}
            hoverCard={true}
            copyToClipboard={true}
          />
        </DetailGridItem>

        <DetailGridItem label={t("fields.start-time")}>
          {formatDate(airdrop.startTime, {
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("fields.end-time")}>
          {formatDate(airdrop.endTime, {
            locale: locale,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("fields.status")}>
          <AirdropStatusIndicator status={airdrop.status} type="standard" />
        </DetailGridItem>
        <DetailGridItem label={t("fields.amount")}>
          {formatNumber(airdrop.recipient.totalAmountAllocated, {
            locale: locale,
            decimals: airdrop.asset.decimals,
            token: airdrop.asset.symbol,
          })}
        </DetailGridItem>
        <DetailGridItem label={t("fields.value")}>
          {formatNumber(
            BigInt(airdrop.price.amount) *
              BigInt(airdrop.recipient.totalAmountAllocated),
            {
              locale: locale,
              currency: airdrop.price.currency,
            }
          )}
        </DetailGridItem>
      </DetailGrid>

      <div className="font-medium text-accent text-xl mt-6 mb-4">
        {t("asset-allocation")}
      </div>
      <DataTable
        columns={Columns}
        toolbar={{
          enableToolbar: false,
        }}
        columnParams={{
          decimals: airdrop.asset.decimals,
          symbol: airdrop.asset.symbol,
          airdrop: airdrop.id,
          recipient: session.data?.user.wallet,
          asset: airdrop.asset.id,
          airdropType: "standard",
        }}
        data={airdrop.recipient.claimIndices}
        name={t("asset-allocation")}
      />
    </>
  );
}
