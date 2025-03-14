import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { FreezeInput } from "@/lib/mutations/fund/freeze/freeze-schema";
import { formatNumber } from "@/lib/utils/number";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<FreezeInput>();
  const t = useTranslations("admin.asset-holders-tab.freeze-form.summary");
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        title={t("freeze-title")}
        description={t("operation-description")}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("asset-label")}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t("amount-label")}
          value={formatNumber(values.amount)}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
