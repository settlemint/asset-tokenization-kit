import { FormStep } from "@/components/blocks/form/form-step";
import { FormSummaryDetailCard } from "@/components/blocks/form/summary/card";
import { FormSummaryDetailItem } from "@/components/blocks/form/summary/item";
import { FlowCard } from "@/components/blocks/xvp/flow-card";
import type { CreateXvpInput } from "@/lib/mutations/xvp/create/create-schema";
import { formatDate } from "@/lib/utils/date";
import { ArrowRightLeft, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";
import { useFormContext } from "react-hook-form";

export function Summary() {
  const t = useTranslations("trade-management.forms");
  const { getValues } = useFormContext<CreateXvpInput>();
  const locale = useLocale();
  const values = getValues();

  return (
    <FormStep title={t("summary.title")} description={t("summary.description")}>
      <FormSummaryDetailCard
        title={t("asset-flows.flows")}
        description={t("asset-flows.flows-summary")}
        icon={<ArrowRightLeft className="size-3 text-primary-foreground" />}
      >
        {values.flows?.map((flow, index) => (
          <Fragment key={index}>
            {flow.from && flow.to && flow.asset && (
              <FlowCard
                from={flow.from}
                to={flow.to}
                amount={flow.amount}
                asset={{
                  symbol: flow.asset.symbol,
                  decimals: flow.asset.decimals,
                  address: flow.asset.id,
                }}
              />
            )}
          </Fragment>
        ))}
      </FormSummaryDetailCard>

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
