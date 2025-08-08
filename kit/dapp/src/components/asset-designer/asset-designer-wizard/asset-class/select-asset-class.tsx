import {
  AssetDesignerFormInputData,
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { Badge } from "@/components/ui/badge";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { withForm } from "@/hooks/use-app-form";
import { useAssetClass } from "@/hooks/use-asset-class";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { getAssetTypeFromFactoryTypeId } from "@/lib/zod/validators/asset-types";
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
                {assetClass.factories.map((factoryType) => (
                  <Badge
                    key={factoryType.typeId}
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
        <DialogHeader className="text-center mt-10">
          <DialogTitle className="text-2xl text-center">
            {t("asset-class:whichAssetClass")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("asset-class:assetClassDifferences")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 mb-10">
          <form.AppField
            name="assetClass"
            children={(field) => (
              <field.RadioField options={options} variant="card" />
            )}
          />
        </div>

        <DialogFooter className="!flex !flex-row !justify-between">
          <form.StepSubmitButton
            onStepSubmit={onStepSubmit}
            validate={validate}
            checkRequiredFn={isRequiredField}
            label={t("asset-designer:form.buttons.next")}
          />
        </DialogFooter>
      </>
    );
  },
});
