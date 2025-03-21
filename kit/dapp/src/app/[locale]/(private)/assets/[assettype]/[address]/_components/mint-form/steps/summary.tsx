import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { MintInput } from "@/lib/mutations/mint/mint-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
  symbol: string;
}

export function Summary({ address, symbol }: SummaryProps) {
  const { getValues } = useFormContext<MintInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = getValues();
  const locale = useLocale();

  return (
    <FormStep title={t("title.mint")} description={t("description.mint")}>
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={formatNumber(values.amount ?? 0, { locale, token: symbol })}
      />
      <FormSummaryDetailItem
        label={t("account-label.recipient")}
        value={values.to ? <EvmAddress address={values.to} /> : null}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
