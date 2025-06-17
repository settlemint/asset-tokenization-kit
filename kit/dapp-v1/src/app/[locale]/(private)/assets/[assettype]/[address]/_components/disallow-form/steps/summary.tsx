import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import type { Address } from "viem";

interface FormValues {
  userAddress: Address;
  address: Address;
}

export function Summary() {
  const { getValues } = useFormContext<FormValues>();
  const t = useTranslations("private.assets.details.forms");
  const { userAddress, address } = getValues();

  return (
    <FormStep
      title={t("summary.title.disallow")}
      description={t("summary.description.disallow")}
    >
      <FormSummaryDetailItem
        label={t("summary.asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("summary.account-label.default")}
        value={<EvmAddress address={userAddress} />}
      />
    </FormStep>
  );
}
