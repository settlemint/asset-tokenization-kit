import { FormStep } from "@/components/blocks/form/form-step";
import { FormOtp } from "@/components/blocks/form/inputs/form-otp";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { FormSummarySecurityConfirmation } from "@/components/blocks/form/summary/security-confirmation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredictedAddress } from "@/hooks/use-predicted-address";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/equity-factory/predict-address";
import { DollarSign, Settings } from "lucide-react";
import { useTranslations, type MessageKeys } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control } = useFormContext<CreateEquityInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("admin.equities.create-form.summary");

  const { isCalculatingAddress, error } = usePredictedAddress({
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
        <FormSummaryDetailItem
          label={t("isin-label")}
          value={values.isin === "" ? "-" : values.isin}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t("configuration-title")}
        description={t("configuration-description")}
        icon={<Settings className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("equity-category-label")}
          value={
            values.equityCategory
              ? t(
                  `category-${values.equityCategory.toLowerCase().replace(/_/g, "-")}` as MessageKeys<
                    "admin.equities.create-form.summary",
                    "equity-category-label"
                  >
                )
              : "-"
          }
        />
        <FormSummaryDetailItem
          label={t("equity-class-label")}
          value={
            values.equityClass
              ? t(
                  `class-${values.equityClass.toLowerCase().replace(/_/g, "-")}` as MessageKeys<
                    "admin.equities.create-form.summary",
                    "equity-class-label"
                  >
                )
              : "-"
          }
        />
      </FormSummaryDetailCard>

      {isCalculatingAddress ? (
        <Skeleton className="h-32 w-full" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{t("error-duplicate")}</AlertDescription>
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
