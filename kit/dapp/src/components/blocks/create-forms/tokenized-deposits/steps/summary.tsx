import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateTokenizedDepositInput } from "@/lib/mutations/tokenized-deposit/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/tokenizeddeposit-factory/predict-address";
import { DollarSign, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control } = useFormContext<CreateTokenizedDepositInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("private.assets.create");

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
          value={`${values.collateralLivenessSeconds} ${t(
            "parameters.common.seconds-unit-label"
          )}`}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = ["predictedAddress"] as const;
Summary.beforeValidate = [
  async ({
    setValue,
    getValues,
  }: UseFormReturn<CreateTokenizedDepositInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue("predictedAddress", predictedAddress);
  },
];
