import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { FreezeInput } from "@/lib/mutations/freeze/freeze-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  balance: number;
  symbol: string;
  decimals: number;
}

export function Amount({ balance, symbol, decimals }: AmountProps) {
  const { control } = useFormContext<FreezeInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();
  const maxLimit = balance;
  const maxLimitDescription = t("max-limit.freeze", {
    limit: formatNumber(maxLimit, {
      token: symbol,
      decimals,
      locale: locale,
    }),
  });

  return (
    <FormStep title={t("title")} description={t("description.freeze")}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={1}
        max={maxLimit}
        description={maxLimitDescription}
        required
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] satisfies (keyof FreezeInput)[];
