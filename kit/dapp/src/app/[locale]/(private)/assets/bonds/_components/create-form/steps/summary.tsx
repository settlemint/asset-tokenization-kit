import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { useVerifyPredictedAddress } from "@/hooks/use-predicted-address";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/bond-factory/predict-address";
import { formatDate } from "@/lib/utils/date";
import { DollarSign, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export function Summary() {
  const { control } = useFormContext<CreateBondInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("admin.bonds.create-form.summary");

  useVerifyPredictedAddress({
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
          label={t("cap-label")}
          value={values.cap || "-"}
        />
        <FormSummaryDetailItem
          label={t("face-value-label")}
          value={values.faceValue || "-"}
        />
        <FormSummaryDetailItem
          label={t("maturity-date-label")}
          value={values.maturityDate ? formatDate(values.maturityDate) : "-"}
        />
        <FormSummaryDetailItem
          label={t("underlying-asset-label")}
          value={values.underlyingAsset || "-"}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = ["pincode", "predictedAddress"] as const;
