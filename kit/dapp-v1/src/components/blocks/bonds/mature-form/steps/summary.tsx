import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { MatureFormInput } from "@/lib/mutations/bond/mature/mature-schema";
import { useTranslations } from "next-intl";
import type { Address } from "viem";

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const t = useTranslations("private.assets.details.forms.summary");

  return (
    <FormStep title={t("title.mature")} description={t("description.mature")}>
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as (keyof MatureFormInput)[];
