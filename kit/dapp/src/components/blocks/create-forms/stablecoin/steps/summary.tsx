import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { useSettings } from "@/hooks/use-settings";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form";
import { AssetAdminsCard } from "../../common/asset-admins/asset-admins-card";

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
          label={t("parameters.common.price-label")}
          value={formatNumber(values.price?.amount || 0, {
            currency: values.price?.currency || baseCurrency,
            locale: locale,
          })}
        />
      </FormSummaryDetailCard>

      <AssetAdminsCard assetAdmins={values.assetAdmins} />
    </FormStep>
  );
}

Summary.validatedFields = [
  "predictedAddress",
] satisfies (keyof CreateStablecoinInput)[];
Summary.beforeValidate = [
  async ({ setValue, getValues }: UseFormReturn<CreateStablecoinInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue("predictedAddress", predictedAddress);
  },
];
