import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  assetClassSelectionFormOptions,
  isRequiredField,
  type AssetClassSelectionInputData,
} from "./shared-form";

const validate: KeysOfUnion<AssetClassSelectionInputData>[] = ["assetClass"];

export const SelectAssetClass = withForm({
  ...assetClassSelectionFormOptions,
  props: {
    onStepSubmit: noop,
    onCancel: noop,
  },
  render: function Render({ form, onStepSubmit, onCancel }) {
    const { t } = useTranslation(["asset-class", "asset-designer"]);
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
                Includes:
              </p>
              <div className="flex flex-wrap gap-1">
                {assetClass.factories.map((factoryType) => (
                  <Badge
                    key={factoryType.typeId}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {getAssetTypeFromFactoryTypeId(factoryType.typeId)}
                  </Badge>
                ))}
              </div>
            </div>
          ),
        })),
      [assetClasses]
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

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("asset-designer:form.buttons.cancel")}
          </Button>

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
