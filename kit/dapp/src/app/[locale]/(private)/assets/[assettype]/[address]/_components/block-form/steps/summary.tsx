import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { BlockUserInput } from "@/lib/mutations/block-user/block-user-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const t = useTranslations("private.assets.details.forms.summary");
  const { getValues } = useFormContext<BlockUserInput>();
  const { user, address } = getValues();

  return (
    <FormStep title={t("title.block")} description={t("description.block")}>
      <FormSummaryDetailItem
        label={t("asset-label")}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t("account-label.default")}
        value={<EvmAddress address={user} />}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
