import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import {
  FormSummaryCard,
  FormSummaryItem,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { formatValue } from "@/lib/utils/format-value";
import { basisPointsToPercentage } from "@atk/zod/basis-points";
import type { FundCategory } from "@atk/zod/fund-categories";
import type { FundClass } from "@atk/zod/fund-classes";
import { useStore } from "@tanstack/react-store";
import { DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

export const FundSummaryFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer", "asset-types", "tokens"]);
    const values = useStore(form.store, (state) => state.values);

    if (values.type !== "fund") {
      return <></>;
    }

    return (
      <>
        <FormSummaryCard
          icon={<DollarSign className="w-5 h-5" />}
          title={t("wizard.steps.summary.instrumentSpecificDetails.title")}
          description={t(
            "wizard.steps.summary.instrumentSpecificDetails.description",
            {
              type: t(`asset-types:types.${values.type}.name`),
            }
          )}
        >
          <FormSummaryItem
            label={t("form.fields.category.label")}
            value={t(
              `tokens:assetClassification.funds.categories.${values.category.toLowerCase() as Lowercase<FundCategory>}`
            )}
          />
          <FormSummaryItem
            label={t("form.fields.class.label")}
            value={t(
              `tokens:assetClassification.funds.classes.${values.class.toLowerCase() as Lowercase<FundClass>}`
            )}
          />
          <FormSummaryItem
            label={t("form.fields.managementFeeBps.label")}
            value={formatValue(
              basisPointsToPercentage(values.managementFeeBps),
              {
                type: "percentage",
              }
            )}
          />
        </FormSummaryCard>
      </>
    );
  },
});
