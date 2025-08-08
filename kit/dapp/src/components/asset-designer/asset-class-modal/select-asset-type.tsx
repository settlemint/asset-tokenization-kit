import { AssetExtensionsList } from "@/components/asset-extensions/asset-extensions-list";
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
import { useStore } from "@tanstack/react-form";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  assetClassSelectionFormOptions,
  isRequiredField,
  type AssetClassSelectionInputData,
} from "./asset-class-form";

const validate: KeysOfUnion<AssetClassSelectionInputData>[] = ["assetType"];

export const SelectAssetType = withForm({
  ...assetClassSelectionFormOptions,
  props: {
    onStepSubmit: noop,
    onBack: noop,
    onCancel: noop,
  },
  render: function Render({ form, onStepSubmit, onBack, onCancel }) {
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
              description: t(`asset-types:types.${assetType}.description`),
              footer: (
                <AssetExtensionsList
                  extensions={factory.tokenExtensions}
                  className="mt-2"
                />
              ),
            };
          }) ?? [],
      [assetClasses, assetClass, t]
    );

    return (
      <>
        <DialogHeader className="text-center mt-10">
          <DialogTitle className="text-2xl text-center">
            {t("asset-types:whichAssetTypeForClass", {
              assetClass: t(
                `asset-class:categories.${assetClass}.name`
              ).toLowerCase(),
            })}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("asset-types:assetTypeDifferences")}
          </DialogDescription>
        </DialogHeader>

        <form.AppField
          name="assetType"
          children={(field) => (
            <field.RadioField
              options={options}
              variant="card"
              className="mt-6 mb-10"
            />
          )}
        />

        <DialogFooter className="!flex !flex-row !justify-between">
          <Button variant="ghost" onClick={onCancel}>
            {t("asset-designer:form.buttons.cancel")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              {t("asset-designer:form.buttons.back")}
            </Button>
            <form.StepSubmitButton
              onStepSubmit={onStepSubmit}
              validate={validate}
              checkRequiredFn={isRequiredField}
              label={t("asset-designer:form.buttons.next")}
            />
          </div>
        </DialogFooter>
      </>
    );
  },
});
