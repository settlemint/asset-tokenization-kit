import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type {
  TransferFormAssetType,
  TransferFormType,
} from "@/lib/mutations/asset/transfer/transfer-schema";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

export function Summary({
  address,
  assetType,
  decimals,
}: {
  address: Address;
  assetType: TransferFormAssetType;
  decimals: number;
}) {
  const { control } = useFormContext<TransferFormType>();
  const t = useTranslations("portfolio.transfer-form.summary");
  const values = useWatch({
    control: control,
  });
  const locale = useLocale();

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        title={t("title")}
        description={t("description")}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem label={t("address")} value={address} />
        <FormSummaryDetailItem
          label={t("amount")}
          value={formatNumber(values.value, { locale })}
        />
      </FormSummaryDetailCard>

      <FormInput
        control={control}
        name="address"
        type="hidden"
        defaultValue={address}
      />
      <FormInput
        control={control}
        name="assetType"
        type="hidden"
        defaultValue={assetType}
      />
      <FormInput
        control={control}
        name="decimals"
        type="hidden"
        defaultValue={decimals}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
