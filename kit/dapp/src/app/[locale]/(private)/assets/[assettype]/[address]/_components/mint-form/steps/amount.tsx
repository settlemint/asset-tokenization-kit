import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import type { MintInput } from "@/lib/mutations/mint/mint-schema";
import { formatNumber } from "@/lib/utils/number";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface AmountProps {
  max?: number;
  decimals?: number;
  symbol: string;
  assettype: AssetType;
}

export function Amount({ max, decimals, symbol, assettype }: AmountProps) {
  const { control } = useFormContext<MintInput>();
  const t = useTranslations("private.assets.details.forms.amount");
  const locale = useLocale();

  const mintLimitReached = max === 0;
  const description = mintLimitReached
    ? assettype === "stablecoin" || assettype === "deposit"
      ? t("max-limit.mint-no-collateral")
      : t("max-limit.mint-no-amount")
    : max
      ? assettype === "stablecoin" || assettype === "deposit"
        ? t("max-limit.collateral-available", {
            limit: formatNumber(max, { locale }),
          })
        : t("max-limit.amount-available", {
            limit: formatNumber(max, { locale }),
          })
      : undefined;

  return (
    <FormStep title={t("title")} description={t("description.mint")}>
      <FormInput
        control={control}
        label={t("label")}
        name="amount"
        type="number"
        max={max}
        step={decimals ? 10 ** -decimals : 1}
        description={description}
        required
        postfix={symbol}
        disabled={mintLimitReached}
      />
    </FormStep>
  );
}

Amount.validatedFields = ["amount"] satisfies (keyof MintInput)[];
