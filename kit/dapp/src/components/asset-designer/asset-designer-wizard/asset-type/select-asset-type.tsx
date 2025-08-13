import {
  assetDesignerFormOptions,
  isRequiredField,
  type AssetDesignerFormInputData,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { AssetExtensionsList } from "@/components/asset-extensions/asset-extensions-list";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { useAssetClass } from "@/hooks/use-asset-class";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { getAssetTypeFromFactoryTypeId } from "@/lib/zod/validators/asset-types";
import { useStore } from "@tanstack/react-form";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const validate: KeysOfUnion<AssetDesignerFormInputData>[] = ["type"];

export const SelectAssetType = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
    onBack: noop,
  },
  render: function Render({ form, onStepSubmit, onBack }) {
    const { t } = useTranslation([
      "asset-designer",
      "asset-types",
      "asset-class",
      "asset-extensions",
    ]);
    const assetClass = useStore(form.store, (state) => state.values.assetClass);
    const { assetClasses } = useAssetClass();

    const options = useMemo(
      () =>
        assetClasses
          .find((ac) => ac.id === assetClass)
          ?.factories.map((factory) => {
            const assetType = getAssetTypeFromFactoryTypeId(factory.typeId);
            return {
              value: assetType,
              label: t(`asset-types:types.${assetType}.name`),
              description: (
                <>
                  {t(`asset-types:types.${assetType}.description`)}
                  <AssetExtensionsList
                    extensions={factory.tokenExtensions}
                    className="mt-4"
                  />
                </>
              ),
            };
          }) ?? [],
      [assetClasses, assetClass, t]
    );

    return (
      <FormStepLayout
        title={t("asset-types:whichAssetTypeForClass", {
          assetClass: t(
            `asset-class:categories.${assetClass}.name`
          ).toLowerCase(),
        })}
        description={t("asset-types:assetTypeDifferences")}
        fullWidth={true}
        actions={
          <>
            <Button variant="outline" onClick={onBack}>
              {t("asset-designer:form.buttons.back")}
            </Button>
            <form.StepSubmitButton
              onStepSubmit={onStepSubmit}
              validate={validate}
              checkRequiredFn={isRequiredField}
              label={t("asset-designer:form.buttons.next")}
            />
          </>
        }
      >
        <div className="mt-6 mb-10">
          <form.AppField
            name="type"
            children={(field) => (
              <field.RadioField options={options} variant="card" />
            )}
          />
        </div>
      </FormStepLayout>
    );
  },
});
