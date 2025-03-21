import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { useSettings } from "@/hooks/use-settings";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/stablecoin-factory/predict-address";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control } = useFormContext<CreateStablecoinInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("private.assets.create");
  const locale = useLocale();
  const baseCurrency = useSettings("baseCurrency");

  return (
    <FormStep title={t("summary.title")} description={t("summary.description")}>
      <FormSummaryDetailCard
        title={t("summary.asset-basics-title")}
        description={t("summary.asset-basics-description")}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("parameters.common.name-label")}
          value={values.assetName}
        />
        <FormSummaryDetailItem
          label={t("parameters.common.symbol-label")}
          value={values.symbol}
        />
        <FormSummaryDetailItem
          label={t("parameters.common.decimals-label")}
          value={values.decimals}
        />
        <FormSummaryDetailItem
          label={t("parameters.common.isin-label")}
          value={values.isin === "" ? "-" : values.isin}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t("summary.configuration-title")}
        description={t("summary.configuration-description")}
        icon={<Settings className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("parameters.common.collateral-proof-validity-label")}
          value={
            values.collateralLivenessValue && values.collateralLivenessTimeUnit
              ? `${values.collateralLivenessValue} ${
                  Number(values.collateralLivenessValue) === 1
                    ? t(
                        `parameters.common.time-units.singular.${values.collateralLivenessTimeUnit}`
                      )
                    : t(
                        `parameters.common.time-units.plural.${values.collateralLivenessTimeUnit}`
                      )
                }`
              : "-"
          }
        />
        <FormSummaryDetailItem
          label={t("parameters.common.value-in-base-currency-label", {
            baseCurrency,
          })}
          value={formatNumber(values.valueInBaseCurrency || 0, {
            currency: baseCurrency,
            locale: locale,
          })}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = ["predictedAddress"] as const;
Summary.beforeValidate = [
  async ({ setValue, getValues }: UseFormReturn<CreateStablecoinInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue("predictedAddress", predictedAddress);
  },
];
