import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { FreezeInput } from "@/lib/mutations/freeze/freeze-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { getValues } = useFormContext<FreezeInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = getValues();
  const locale = useLocale();

  return (
    <FormStep title={t("title.freeze")} description={t("description.freeze")}>
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={formatNumber(values.amount, { locale })}
      />
      <FormSummaryDetailItem
        label={t("account-label.default")}
        value={<EvmAddress address={values.userAddress} />}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
