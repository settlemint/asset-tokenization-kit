import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import {
  FormSummaryCard,
  FormSummaryItem,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import type { EquityCategory } from "@atk/zod/equity-categories";
import type { EquityClass } from "@atk/zod/equity-classes";
import { useStore } from "@tanstack/react-store";
import { DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EquitySummaryFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer", "asset-types", "tokens"]);
    const values = useStore(form.store, (state) => state.values);

    if (values.type !== "equity") {
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
              `tokens:assetClassification.equity.categories.${values.category.toLowerCase() as Lowercase<EquityCategory>}`
            )}
          />
          <FormSummaryItem
            label={t("form.fields.class.label")}
            value={t(
              `tokens:assetClassification.equity.classes.${values.class.toLowerCase() as Lowercase<EquityClass>}`
            )}
          />
        </FormSummaryCard>
      </>
    );
  },
});
