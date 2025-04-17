import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { getPredictedAddress } from "@/lib/queries/bond-factory/bond-factory-predict-address";
import { formatDate } from "@/lib/utils/date";
import { DollarSign, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type UseFormReturn, useFormContext, useWatch } from "react-hook-form";
import { AssetAdminsCard } from "../../common/asset-admins/asset-admins-card";

export function Summary() {
  const { control } = useFormContext<CreateBondInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations("private.assets.create");
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
          label={t("parameters.bonds.cap-label")}
          value={values.cap || "-"}
        />
        <FormSummaryDetailItem
          label={t("parameters.bonds.face-value-label")}
          value={values.faceValue || "-"}
        />
        <FormSummaryDetailItem
          label={t("parameters.bonds.maturity-date-label")}
          value={
            values.maturityDate
              ? formatDate(values.maturityDate, { locale })
              : "-"
          }
        />
        <FormSummaryDetailItem
          label={t("parameters.bonds.underlying-asset-label")}
          value={
            values.underlyingAsset?.id ? (
              <EvmAddress address={values.underlyingAsset.id} />
            ) : (
              "-"
            )
          }
        />
      </FormSummaryDetailCard>

      <AssetAdminsCard assetAdmins={values.assetAdmins} />
    </FormStep>
  );
}

Summary.validatedFields = [
  "predictedAddress",
] satisfies (keyof CreateBondInput)[];

Summary.beforeValidate = [
  async ({ setValue, getValues }: UseFormReturn<CreateBondInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue("predictedAddress", predictedAddress);
  },
];
