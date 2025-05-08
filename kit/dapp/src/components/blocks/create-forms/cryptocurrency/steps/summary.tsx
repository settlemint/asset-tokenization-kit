import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { useSettings } from "@/hooks/use-settings";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-predict-address";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form";
import { AssetAdminsCard } from "../../common/asset-admins/asset-admins-card";

export function Summary() {
  const { control } = useFormContext<CreateCryptoCurrencyInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("private.assets.create");
  const baseCurrency = useSettings("baseCurrency");
  const locale = useLocale();
  const posthog = usePostHog();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("create_cryptocurrency_form_summary_step_opened");
    }
  }, [posthog]);

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
          label={t("parameters.cryptocurrencies.initial-supply-label")}
          value={values.initialSupply || "-"}
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

const validatePredictedAddress = async (
  form: UseFormReturn<CreateCryptoCurrencyInput>
) => {
  const values = form.getValues();
  const predictedAddress = await getPredictedAddress(values);
  const isAvailable = await isAddressAvailable(predictedAddress);
  if (!isAvailable) {
    form.setError("predictedAddress", {
      message: "private.assets.create.form.duplicate-errors.cryptocurrency",
    });
    return false;
  }
  form.clearErrors("predictedAddress");
  return true;
};

Summary.customValidation = [validatePredictedAddress];
