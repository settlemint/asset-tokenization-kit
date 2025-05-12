import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

interface SummaryProps {
  xvp: Address;
}

export function Summary({ xvp }: SummaryProps) {
  const t = useTranslations("trade-management.xvp");

  return (
    <FormStep
      title={t("execute-settlement")}
      description={t("execute-settlement-description")}
    >
      <FormSummaryDetailItem
        label={t("xvp-settlement")}
        value={<EvmAddress address={xvp} />}
      />
    </FormStep>
  );
}
