import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import type { CreateXvpInput } from "@/lib/mutations/xvp/create/create-schema";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { ArrowUpRight, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const t = useTranslations("trade-management.forms");
  const { getValues } = useFormContext<CreateXvpInput>();
  const locale = useLocale();
  const values = getValues();

  return (
    <FormStep title={t("summary.title")} description={t("summary.description")}>
      {values.flows?.map((flow, index) => (
        <FormSummaryDetailCard
          key={index}
          title={t("asset-flows.flow", { index: index + 1 })}
          description={t("asset-flows.description")}
          icon={<ArrowUpRight className="size-3 text-primary-foreground" />}
        >
          <FormSummaryDetailItem
            label={t("asset-flows.asset")}
            value={
              flow.asset && (
                <EvmAddress address={flow.asset.id} showAssetType={true} />
              )
            }
          />
          <FormSummaryDetailItem
            label={t("asset-flows.amount")}
            value={
              flow.amount && flow.asset
                ? formatNumber(flow.amount, {
                    locale,
                    decimals: flow.asset.decimals,
                    token: flow.asset.symbol,
                  })
                : null
            }
          />
          <FormSummaryDetailItem
            label={t("asset-flows.from")}
            value={flow.from ? <EvmAddress address={flow.from} /> : null}
          />
          <FormSummaryDetailItem
            label={t("asset-flows.to")}
            value={flow.to ? <EvmAddress address={flow.to} /> : null}
          />
        </FormSummaryDetailCard>
      ))}

      <FormSummaryDetailCard
        title={t("configuration.title")}
        description={t("configuration.description")}
        icon={<Lock className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t("configuration.expiry")}
          value={values.expiry ? formatDate(values.expiry, { locale }) : null}
        />
        <FormSummaryDetailItem
          label={t("configuration.auto-execute")}
          value={values.autoExecute ? t("summary.yes") : t("summary.no")}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}
