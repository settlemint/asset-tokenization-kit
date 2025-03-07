import { FormStep } from "@/components/blocks/form/form-step";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { FormSummarySecurityConfirmation } from "@/components/blocks/form/summary/security-confirmation";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { getPredictedAddress } from "@/lib/mutations/cryptocurrency/create/predict-address";
import { DollarSign, Loader2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control, trigger, setValue, formState, setError } =
    useFormContext<CreateCryptoCurrencyInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("admin.cryptocurrencies.create-form.summary");
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const calculateAddress = async () => {
      setIsCalculating(true);
      try {
        const calculationData = {
          assetName: values.assetName!,
          symbol: values.symbol!,
          decimals: values.decimals!,
          initialSupply: values.initialSupply ?? 0,
        };

        const predictedAddress = await getPredictedAddress(calculationData);
        console.log("predictedAddress", predictedAddress);
        setValue("predictedAddress", predictedAddress, {
          shouldValidate: true,
        });
      } catch (error) {
        console.error("Failed to calculate predicted address:", error);
        setError("predictedAddress", {
          message: "Failed to calculate predicted address",
        });
      } finally {
        setIsCalculating(false);
      }
    };

    void calculateAddress();
  }, [
    values.assetName,
    values.symbol,
    values.decimals,
    values.initialSupply,
    setValue,
  ]);

  return (
    <FormStep title={t("title")} description={t("description")}>
      {isCalculating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Calculating predicted address...</span>
        </div>
      )}

      <FormSummaryDetailCard
        title={t("asset-basics-title")}
        description={t("asset-basics-description")}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("name-label")}
          value={values.assetName}
        />
        <FormSummaryDetailItem
          label={t("symbol-label")}
          value={values.symbol}
        />
        <FormSummaryDetailItem
          label={t("decimals-label")}
          value={values.decimals}
        />
        {formState.errors.predictedAddress && (
          <div className="text-red-400 text-sm">
            {formState.errors.predictedAddress.message}
          </div>
        )}
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t("configuration-title")}
        description={t("configuration-description")}
        icon={<Settings className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("initial-supply-label")}
          value={values.initialSupply || "-"}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ["pincode", "predictedAddress"] as const;
