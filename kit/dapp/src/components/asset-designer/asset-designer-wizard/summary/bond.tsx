import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import {
  FormSummaryCard,
  FormSummaryItem,
} from "@/components/form/multi-step/form-step";
import { Web3Address } from "@/components/web3/web3-address";
import { withForm } from "@/hooks/use-app-form";
import { formatDate } from "@/lib/utils/date";
import { useStore } from "@tanstack/react-store";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAddress } from "viem";

export const BondSummaryFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);
    const values = useStore(form.store, (state) => state.values);

    if (values.type !== "bond") {
      return <></>;
    }

    return (
      <FormSummaryCard
        icon={<Settings className="w-5 h-5" />}
        title={t("wizard.steps.summary.instrumentSpecificDetails.title")}
        description={t(
          "wizard.steps.summary.instrumentSpecificDetails.description",
          { type: t(`asset-types:types.${values.type}.name`) }
        )}
      >
        <FormSummaryItem
          label={t("form.fields.cap.label")}
          value={values.cap as string}
        />
        <FormSummaryItem
          label={t("form.fields.maturityDate.label")}
          value={formatDate(values.maturityDate as string)}
        />
        <FormSummaryItem
          label={t("form.fields.denominationAsset.label")}
          value={
            <Web3Address
              address={getAddress(values.denominationAsset)}
              size="tiny"
            />
          }
        />
        <FormSummaryItem
          label={t("form.fields.faceValue.label")}
          value={values.faceValue as string}
        />
      </FormSummaryCard>
    );
  },
});
