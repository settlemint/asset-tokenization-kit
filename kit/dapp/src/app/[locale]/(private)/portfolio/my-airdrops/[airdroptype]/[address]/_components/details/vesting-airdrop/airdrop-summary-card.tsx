import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import {
  calculateAmountOnInitialization,
  calculateClaimableAmount,
} from "@/lib/queries/vesting-airdrop/vesting-airdrop-amount";
import { formatNumber } from "@/lib/utils/number";
import { Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Address } from "viem";

export interface VestingAirdropSummaryConfigurationCardProps {
  asset: Address;
  decimals: number;
  symbol: string;
  amountExact: bigint;
  claimedAmountExact: bigint;
  cliffDuration: bigint;
  vestingDuration: bigint;
  vestingStart?: Date;
}

export function VestingAirdropSummaryConfigurationCard({
  asset,
  amountExact,
  claimedAmountExact,
  decimals,
  symbol,
  cliffDuration,
  vestingDuration,
  vestingStart,
}: VestingAirdropSummaryConfigurationCardProps) {
  const t = useTranslations("portfolio.my-airdrops.details.forms.summary");
  const locale = useLocale();

  const { claimableAmountExact, lockedAmountExact } = vestingStart
    ? calculateClaimableAmount(
        amountExact,
        claimedAmountExact,
        vestingDuration,
        vestingStart
      )
    : calculateAmountOnInitialization(
        cliffDuration,
        vestingDuration,
        amountExact
      );

  return (
    <FormSummaryDetailCard
      icon={<Settings size={16} />}
      title={t("card.title")}
      description={t("card.description")}
    >
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={asset} />}
      />
      <FormSummaryDetailItem
        label={t("claimable-amount-label")}
        value={formatNumber(claimableAmountExact, {
          locale: locale,
          decimals: decimals,
          token: symbol,
          adjustDecimals: true,
        })}
      />
    </FormSummaryDetailCard>
  );
}
