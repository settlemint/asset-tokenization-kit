import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { useSettings } from "@/hooks/use-settings";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/fund-factory/fund-factory-predict-address";
import { formatNumber } from "@/lib/utils/number";
import type { fundCategories, fundClasses } from "@/lib/utils/zod";
import { DollarSign, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form";
import { FundCategoriesSummary } from "./_components/fund-categories-summary";
import { FundClassesSummary } from "./_components/fund-classes-summary";

export function Summary() {
  const { control } = useFormContext<CreateFundInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("private.assets.create");
  const baseCurrency = useSettings("baseCurrency");
  const locale = useLocale();

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
          label={t("parameters.funds.fund-category-label")}
          value={
            values.fundCategory ? (
              <FundCategoriesSummary
                value={values.fundCategory as (typeof fundCategories)[number]}
              />
            ) : (
              "-"
            )
          }
        />
        <FormSummaryDetailItem
          label={t("parameters.funds.fund-class-label")}
          value={
            values.fundClass ? (
              <FundClassesSummary
                value={values.fundClass as (typeof fundClasses)[number]}
              />
            ) : (
              "-"
            )
          }
        />
        <FormSummaryDetailItem
          label={t("parameters.funds.management-fee-label")}
          value={
            values.managementFeeBps
              ? `${values.managementFeeBps / 100}% (${values.managementFeeBps} ${t("parameters.funds.basis-points")})`
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
  async ({ setValue, getValues }: UseFormReturn<CreateFundInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue("predictedAddress", predictedAddress);
  },
];
