import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { ArrowDownLeft, ArrowUpRight, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const t = useTranslations("trade-management.forms.summary");
  const { getValues } = useFormContext<CreateDvpSwapInput>();
  const locale = useLocale();
  const values = getValues();

  return (
    <FormStep title={t("title")} description={t("description")}>
      <FormSummaryDetailCard
        title={t("offer")}
        description={t("offer-description")}
        icon={<ArrowUpRight className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("amount")}
          value={formatNumber(values.offerAmount, {
            locale,
            decimals: values.offerAsset.decimals,
            token: values.offerAsset.symbol,
          })}
        />
        <FormSummaryDetailItem
          label={t("to")}
          value={<EvmAddress address={values.user} />}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t("request")}
        description={t("request-description")}
        icon={<ArrowDownLeft className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("amount")}
          value={formatNumber(values.requestAmount, {
            locale,
            decimals: values.requestAsset.decimals,
            token: values.requestAsset.symbol,
          })}
        />
        <FormSummaryDetailItem
          label={t("from")}
          value={<EvmAddress address={values.user} />}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t("configuration")}
        description={t("configuration-description")}
        icon={<Lock className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("expiry")}
          value={formatDate(values.expiry, {
            locale,
          })}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}
