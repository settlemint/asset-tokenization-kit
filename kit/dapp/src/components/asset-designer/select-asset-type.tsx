import {
  assetDesignerFormOptions,
  isRequiredField,
  type AssetDesignerFormInputData,
} from "@/components/asset-designer/shared-form";
import {
  FormStep,
  FormStepContent,
  FormStepDescription,
  FormStepHeader,
  FormStepSubmit,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { getAssetTypeFromFactoryTypeId } from "@/lib/zod/validators/asset-types";
import type { FactoryList } from "@/orpc/routes/token/routes/factory/factory.list.schema";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const assetTypeFields: KeysOfUnion<AssetDesignerFormInputData>[] = ["type"];

export const SelectAssetType = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
    factories: [] as FactoryList,
  },
  render: function Render({ form, onStepSubmit, factories }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);

    const options = useMemo(() => {
      if (!factories) return [];

      const assetTypes = factories.map((factory) => {
        return getAssetTypeFromFactoryTypeId(factory.typeId);
      });

      return assetTypes.map((type) => ({
        value: type,
        label: t(`asset-types:${type}.name`),
        description: t(`asset-types:${type}.description`),
      }));
    }, [factories, t]);

    return (
      <FormStep>
        <FormStepHeader>
          <FormStepTitle>
            {t("wizard.steps.selectAssetType.title")}
          </FormStepTitle>
          <FormStepDescription>
            {t("wizard.steps.selectAssetType.description")}
          </FormStepDescription>
        </FormStepHeader>

        <FormStepContent>
          <form.AppField
            name="type"
            children={(field) => (
              <field.RadioField
                label={t("wizard.steps.asset-type.title")}
                options={options}
                variant="card"
              />
            )}
          />
        </FormStepContent>

        <FormStepSubmit>
          <form.StepSubmitButton
            label={t("form.buttons.next")}
            onStepSubmit={onStepSubmit}
            validate={assetTypeFields}
            checkRequiredFn={isRequiredField}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
