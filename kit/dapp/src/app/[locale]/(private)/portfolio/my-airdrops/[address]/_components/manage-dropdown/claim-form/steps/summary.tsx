import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { ClaimStandardAirdropInput } from "@/lib/mutations/airdrop/claim/standard/claim-schema";
import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const t = useTranslations("portfolio.my-airdrops.details.forms.summary");
  const locale = useLocale();
  const form = useFormContext<ClaimStandardAirdropInput>();
  const values = form.getValues();

  return (
    <FormStep title={t("title.claim")} description={t("description.claim")}>
      <FormSummaryDetailItem
        label={t("airdrop-contract-label")}
        value={values.airdrop ? <EvmAddress address={values.airdrop} /> : "-"}
      />
      <FormSummaryDetailItem
        label={t("amount-label")}
        value={
          values.amount
            ? formatNumber(values.amount, {
                decimals: values.asset.decimals,
                token: values.asset.symbol,
                locale,
              })
            : "-"
        }
      />
      <FormSummaryDetailItem
        label={t("value-label")}
        value={
          values.price
            ? formatNumber(values.price.amount, {
                currency: values.price.currency,
                locale,
              })
            : "-"
        }
      />
    </FormStep>
  );
}
