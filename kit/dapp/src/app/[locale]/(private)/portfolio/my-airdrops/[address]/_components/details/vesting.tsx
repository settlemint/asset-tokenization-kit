"use client";

import { AirdropClaimStatusIndicator } from "@/components/blocks/airdrop-claim-status/airdrop-claim-status";
import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import type { VestingAirdropRecipient } from "@/lib/queries/airdrop/airdrop-recipient-schema";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import type { Price } from "@/lib/utils/typebox/price";
import { addSeconds } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

export function VestingAirdropDetails({
  airdrop,
  amount,
  price,
}: {
  airdrop: VestingAirdropRecipient;
  amount: string;
  index: number;
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
          adjustDecimals: true,
          token: airdrop.asset.symbol,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("value")}>
        {formatNumber(price.amount, {
          locale: locale,
          currency: price.currency,
        })}
      </DetailGridItem>
      {airdrop.userVestingData && (
        <DetailGridItem label={t("vesting-start")}>
          {formatDate(airdrop.userVestingData.vestingStart, {
            locale: locale,
          })}
        </DetailGridItem>
      )}
      {airdrop.userVestingData && (
        <DetailGridItem label={t("vesting-end")}>
          {formatDate(
            addSeconds(
              airdrop.userVestingData.vestingStart,
              Number(airdrop.strategy.vestingDuration)
            ),
            {
              locale: locale,
            }
          )}
        </DetailGridItem>
      )}

      {airdrop.userVestingData && (
        <DetailGridItem
          label={t("vesting-cliff-end")}
          info={t("vesting-cliff-end-info")}
        >
          {formatDate(
            addSeconds(
              airdrop.userVestingData.vestingStart,
              Number(airdrop.strategy.cliffDuration)
            ),
            { locale: locale }
          )}
        </DetailGridItem>
      )}
    </DetailGrid>
  );
}
