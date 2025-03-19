import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { BurnInput } from "@/lib/mutations/burn/burn-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { getValues } = useFormContext<BurnInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = getValues();
  const locale = useLocale();

  return (
    <FormStep title={t("title.burn")} description={t("description.burn")}>
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={formatNumber(values.amount, { locale })}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
