import { FormStep } from "@/components/blocks/form/form-step";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { FormSummarySecurityConfirmation } from "@/components/blocks/form/summary/security-confirmation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredictedAddress } from "@/hooks/use-predicted-address";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/cryptocurrency-factory/predict-address";
import { DollarSign, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control, formState } = useFormContext<CreateCryptoCurrencyInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("admin.cryptocurrencies.create-form.summary");

  const { isCalculating, error } = usePredictedAddress({
    calculateAddress: getPredictedAddress,
    fieldName: "predictedAddress",
  });

  return (
    <FormStep title={t("title")} description={t("description")}>
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

      {isCalculating ? (
        <Skeleton className="h-32 w-full" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>
            A Cryptocurrency with the same details already exists.
          </AlertTitle>
          <AlertDescription>
            A Cryptocurrency with the same details already exists. Please try
            again with at least one different parameter.
          </AlertDescription>
        </Alert>
      ) : (
        <FormSummarySecurityConfirmation>
          <FormOtp control={control} name="pincode" />
        </FormSummarySecurityConfirmation>
      )}
    </FormStep>
  );
}

Summary.validatedFields = ["pincode", "predictedAddress"] as const;
