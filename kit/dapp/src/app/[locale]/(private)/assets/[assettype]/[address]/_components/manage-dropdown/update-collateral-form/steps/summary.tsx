import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { UpdateCollateralInput } from "@/lib/mutations/update-collateral/update-collateral-schema";
import { formatNumber } from "@/lib/utils/number";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<UpdateCollateralInput>();
  const t = useTranslations("private.assets.details.forms.summary");
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep
      title={t("title.update-collateral")}
      description={t("description.update-collateral")}
    >
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={formatNumber(values.amount ?? 0)}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
