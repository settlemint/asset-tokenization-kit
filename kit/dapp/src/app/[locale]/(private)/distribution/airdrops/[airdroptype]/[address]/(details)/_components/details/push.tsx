import { DetailGrid } from "@/components/blocks/detail-grid/detail-grid";
import { DetailGridItem } from "@/components/blocks/detail-grid/detail-grid-item";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { getUser } from "@/lib/auth/utils";
import { getPushAirdropDetail } from "@/lib/queries/push-airdrop/push-airdrop-detail";
import { formatNumber } from "@/lib/utils/number";
import { getLocale, getTranslations } from "next-intl/server";
import type { Address } from "viem";

interface PushAirdropDetailsProps {
  address: Address;
}

export async function PushAirdropDetails({ address }: PushAirdropDetailsProps) {
  const user = await getUser();
  const [airdrop, t, locale] = await Promise.all([
    getPushAirdropDetail({ address, user }),
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
      <DetailGridItem label={t("type")}>{t("type-push")}</DetailGridItem>
      <DetailGridItem label={t("asset")}>
        <EvmAddress
          address={airdrop.asset.id}
          prettyNames={true}
          hoverCard={true}
          copyToClipboard={true}
        />
      </DetailGridItem>
      <DetailGridItem
        label={t("total-distributed")}
        info={t("total-distributed-info")}
      >
        {formatNumber(airdrop.totalDistributed, {
          token: airdrop.asset.symbol,
          decimals: airdrop.asset.decimals,
          locale: locale,
        })}
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
        label={t("distribution-cap")}
        info={t("distribution-cap-info")}
      >
        {formatNumber(airdrop.distributionCap, {
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
      <DetailGridItem label={t("status")}>{t("status-active")}</DetailGridItem>
    </DetailGrid>
  );
}
