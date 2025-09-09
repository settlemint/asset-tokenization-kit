import {
  type AssetDesignerFormInputData,
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Badge } from "@/components/ui/badge";
import { withForm } from "@/hooks/use-app-form";
import { useAssetClass } from "@/hooks/use-asset-class";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { getAssetTypeFromFactoryTypeId } from "@atk/zod/asset-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const validate: KeysOfUnion<AssetDesignerFormInputData>[] = ["assetClass"];

export const SelectAssetClass = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation([
      "asset-class",
      "asset-designer",
      "asset-types",
    ]);
    const { assetClasses } = useAssetClass();

    const options = useMemo(
      () =>
        assetClasses.map((assetClass) => ({
          value: assetClass.id,
          label: assetClass.name,
          description: assetClass.description,
          icon: assetClass.icon,
          footer: (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {t("asset-class:includes")}
              </p>
              <div className="flex flex-wrap gap-1">
                {assetClass.factories.map((factoryType, i) => (
                  <Badge
                    key={`${factoryType.typeId}-${i}`}
                    variant="outline"
                    className="text-xs"
                  >
                    {t(
                      `asset-types:types.${getAssetTypeFromFactoryTypeId(factoryType.typeId)}.name`
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          ),
        })),
      [assetClasses, t]
    );

    return (
      <>
        <FormStepLayout
          title={t("asset-class:whichAssetClass")}
          description={t("asset-class:assetClassDifferences")}
          fullWidth={true}
          actions={
            <form.StepSubmitButton
              onStepSubmit={onStepSubmit}
              validate={validate}
              checkRequiredFn={isRequiredField}
              label={t("asset-designer:form.buttons.next")}
            />
          }
        >
          <div className="mt-6 mb-10">
            <form.AppField
              name="assetClass"
              children={(field) => (
                <field.RadioField options={options} variant="card" />
              )}
            />
          </div>
        </FormStepLayout>
      </>
    );
  },
});
