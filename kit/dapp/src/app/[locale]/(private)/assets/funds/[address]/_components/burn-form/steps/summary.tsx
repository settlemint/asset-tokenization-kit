import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { BurnInput } from "@/lib/mutations/fund/burn/burn-schema";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<BurnInput>();
  const t = useTranslations("admin.funds.burn-form.summary");
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        title={t("burn-title")}
        description={t("burn-description")}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("asset-label")}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t("amount-label")}
          value={formatNumber(values.amount ?? 0)}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
