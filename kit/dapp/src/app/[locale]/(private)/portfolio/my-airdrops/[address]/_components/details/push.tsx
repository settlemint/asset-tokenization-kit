"use client";

import { AirdropClaimStatusIndicator } from "@/components/blocks/airdrop-claim-status/airdrop-claim-status";
import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import type { PushAirdropRecipient } from "@/lib/queries/airdrop/user-airdrop-schema";
import { formatNumber } from "@/lib/utils/number";
import type { Price } from "@/lib/utils/typebox/price";
import { useLocale, useTranslations } from "next-intl";

export function PushAirdropDetails({
  airdrop,
  amount,
  price,
}: {
  airdrop: PushAirdropRecipient;
  amount: string;
  index: bigint;
  price: Price;
}) {
  const t = useTranslations("private.airdrops.details.fields");
  const locale = useLocale();

  return (
    <DetailGrid>
      <DetailGridItem label={t("contract-address")}>
        <EvmAddress
          address={airdrop.id}
          prettyNames={false}
          hoverCard={false}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("type")}>{t("type-standard")}</DetailGridItem>
      <DetailGridItem label={t("asset")}>
        <EvmAddress
          address={airdrop.asset.id}
          prettyNames={true}
          hoverCard={true}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("status")}>
        <AirdropClaimStatusIndicator airdrop={airdrop} />
      </DetailGridItem>
      <DetailGridItem label={t("amount")}>
        {formatNumber(amount, {
          locale: locale,
          decimals: airdrop.asset.decimals,
          token: airdrop.asset.symbol,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("value")}>
        {formatNumber(price.amount, {
          locale: locale,
          currency: price.currency,
        })}
      </DetailGridItem>
    </DetailGrid>
  );
}
