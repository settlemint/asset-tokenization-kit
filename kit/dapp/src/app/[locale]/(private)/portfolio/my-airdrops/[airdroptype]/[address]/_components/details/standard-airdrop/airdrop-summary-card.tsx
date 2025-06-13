import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { formatNumber } from "@/lib/utils/number";
import { Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Address } from "viem";

export interface StandardAirdropSummaryConfigurationCardProps {
  asset: Address;
  amount: number;
  decimals: number;
  symbol: string;
}

export function StandardAirdropSummaryConfigurationCard({
  asset,
  amount,
  decimals,
  symbol,
}: StandardAirdropSummaryConfigurationCardProps) {
  const t = useTranslations("portfolio.my-airdrops.details.forms.summary");
  const locale = useLocale();

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
        label={t("amount-label")}
        value={formatNumber(amount, {
          locale: locale,
          decimals: decimals,
          token: symbol,
        })}
      />
    </FormSummaryDetailCard>
  );
}
