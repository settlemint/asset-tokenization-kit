import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateDvpSwapInput } from "@/lib/mutations/dvp/create/create-schema";
import { formatNumber } from "@/lib/utils/number";
import { Coins, Lock, Users } from "lucide-react";
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
        title={t("participant-details")}
        description={t("participant-details")}
        icon={<Users className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("sender")}
          value={<EvmAddress address={values.sender} />}
        />
        <FormSummaryDetailItem
          label={t("receiver")}
          value={<EvmAddress address={values.receiver} />}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t("asset-details")}
        description={t("asset-details-description")}
        icon={<Coins className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("assets-to-send")}
          value={formatNumber(values.amountToSend, {
            locale,
            decimals: values.assetToSend.decimals,
            token: values.assetToSend.symbol,
          })}
        />
        <FormSummaryDetailItem
          label={t("assets-to-receive")}
          value={formatNumber(values.amountToReceive, {
            locale,
            decimals: values.assetToReceive.decimals,
            token: values.assetToReceive.symbol,
          })}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t("configuration")}
        description={t("configuration-description")}
        icon={<Lock className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem label={t("timelock")} value={values.timelock} />
        <FormSummaryDetailItem label={t("secret")} value={values.secret} />
      </FormSummaryDetailCard>
    </FormStep>
  );
}
