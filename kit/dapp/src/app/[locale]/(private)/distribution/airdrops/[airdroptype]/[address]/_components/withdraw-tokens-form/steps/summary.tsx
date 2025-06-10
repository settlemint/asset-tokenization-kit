import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { WithdrawTokensFromAirdropInput } from "@/lib/mutations/airdrop/withdraw-token/withdraw-token-schema";
import type { PushAirdrop } from "@/lib/queries/push-airdrop/push-airdrop-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface SummaryProps {
  airdrop: PushAirdrop;
}

export function Summary({ airdrop }: SummaryProps) {
  const t = useTranslations("private.airdrops.detail.forms.withdraw-tokens");
  const locale = useLocale();

  const { getValues } = useFormContext<WithdrawTokensFromAirdropInput>();
  const formValues = getValues();

  return (
    <FormStep title={t("summary-title")} description={t("summary-description")}>
      <FormSummaryDetailItem
        label={t("airdrop-label")}
        value={<EvmAddress address={airdrop.id} prettyNames={true} />}
      />

      <FormSummaryDetailItem
        label={t("airdrop-asset-label")}
        value={<EvmAddress address={airdrop.asset.id} prettyNames={true} />}
      />

      <FormSummaryDetailItem
        label={t("withdraw-amount-label")}
        value={formatNumber(formValues.amount ?? 0, {
          locale,
          token: airdrop.asset.symbol,
          decimals: airdrop.asset.decimals,
        })}
      />
    </FormStep>
  );
}

type SummaryComponent = typeof Summary & {
  validatedFields: (keyof WithdrawTokensFromAirdropInput)[];
};

(Summary as SummaryComponent).validatedFields =
  [] satisfies (keyof WithdrawTokensFromAirdropInput)[];
