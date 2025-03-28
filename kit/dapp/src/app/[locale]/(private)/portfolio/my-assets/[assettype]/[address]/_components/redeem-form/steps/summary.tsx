import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { RedeemBondInput } from "@/lib/mutations/bond/redeem/redeem-schema";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<RedeemBondInput>();
  const t = useTranslations("portfolio.my-assets.bond.redeem-form.summary");
  const values = useWatch({
    control: control,
  });
  const locale = useLocale();

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        icon={<DollarSign className="size-3 text-primary-foreground" />}
        title={t("redeem-title")}
        description={t("redeem-description")}
      >
        <FormSummaryDetailItem
          label={t("asset-label")}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t("value-label")}
          value={formatNumber(values.amount ?? 0, { locale })}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as (keyof RedeemBondInput)[];
