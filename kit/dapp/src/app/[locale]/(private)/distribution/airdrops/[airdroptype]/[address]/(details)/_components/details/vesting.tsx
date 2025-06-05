import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getVestingAirdropDetail } from "@/lib/queries/vesting-airdrop/vesting-airdrop-detail";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { isAfter } from "date-fns";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface VestingAirdropDetailsProps {
  address: Address;
}

export async function VestingAirdropDetails({
  address,
}: VestingAirdropDetailsProps) {
  const [airdrop, t, locale] = await Promise.all([
    getVestingAirdropDetail({ address }),
    getTranslations("private.airdrops.details.fields"),
    getLocale(),
  ]);

  // Calculate claim percentage
  const claimPercentage =
    airdrop.distribution.length > 0
      ? (airdrop.totalRecipients / airdrop.distribution.length) * 100
      : 0;

  // Calculate total distribution amount
  const totalDistributionAmount = airdrop.distribution.reduce(
    (sum, dist) => sum + dist.amount,
    0
  );

  // Format vesting durations
  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    if (days > 0) return `${days} ${t("duration-days")}`;
    if (hours > 0) return `${hours} ${t("duration-hours")}`;
    return `${minutes} ${t("duration-minutes")}`;
  };

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
      <DetailGridItem label={t("type")}>{t("type-vesting")}</DetailGridItem>
      <DetailGridItem label={t("asset")}>
        <EvmAddress
          address={airdrop.asset.id}
          prettyNames={true}
          hoverCard={true}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem label={t("claim-period-end")}>
        {formatDate(airdrop.claimPeriodEnd, {
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("vesting-strategy")}>
        {t("strategy-linear")}
      </DetailGridItem>
      <DetailGridItem
        label={t("cliff-duration")}
        info={t("cliff-duration-info")}
      >
        {formatDuration(Number(airdrop.strategy.cliffDuration))}
      </DetailGridItem>
      <DetailGridItem
        label={t("vesting-duration")}
        info={t("vesting-duration-info")}
      >
        {formatDuration(Number(airdrop.strategy.vestingDuration))}
      </DetailGridItem>
      <DetailGridItem label={t("total-claims")} info={t("total-claims-info")}>
        {airdrop.totalRecipients}
      </DetailGridItem>
      <DetailGridItem
        label={t("eligible-recipients")}
        info={t("eligible-recipients-info")}
      >
        {airdrop.distribution.length}
      </DetailGridItem>
      <DetailGridItem label={t("total-claimed")} info={t("total-claimed-info")}>
        {formatNumber(airdrop.totalClaimed, {
          token: airdrop.asset.symbol,
          decimals: airdrop.asset.decimals,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem
        label={t("total-distribution-amount")}
        info={t("total-distribution-amount-info")}
      >
        {formatNumber(totalDistributionAmount, {
          token: airdrop.asset.symbol,
          decimals: airdrop.asset.decimals,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem
        label={t("claim-percentage")}
        info={t("claim-percentage-info")}
      >
        {formatNumber(claimPercentage, {
          percentage: true,
          decimals: 2,
          locale: locale,
        })}
      </DetailGridItem>
      <DetailGridItem label={t("status")}>
        {isAfter(new Date(), airdrop.claimPeriodEnd)
          ? t("status-expired")
          : t("status-active")}
      </DetailGridItem>
    </DetailGrid>
  );
}
