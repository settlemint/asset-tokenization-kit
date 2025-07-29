import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import {
  getAssetClassFromFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  assetClassSelectionFormOptions,
  isRequiredField,
  type AssetClassSelectionInputData,
} from "./shared-form";

const validate: KeysOfUnion<AssetClassSelectionInputData>[] = ["assetType"];

export const SelectAssetType = withForm({
  ...assetClassSelectionFormOptions,
  props: {
    onStepSubmit: noop,
    onBack: noop,
    onCancel: noop,
  },
  render: function Render({ form, onStepSubmit, onBack, onCancel }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);

    // Get factories data
    const { data: factories } = useSuspenseQuery(
      orpc.token.factoryList.queryOptions({
        input: {},
      })
    );

    // Get current form values
    const assetClass = useStore(form.store, (state) => state.values.assetClass);

    // Filter factories for the selected asset class
    const selectedClassFactories = factories.filter(
      (factory) => getAssetClassFromFactoryTypeId(factory.typeId) === assetClass
    );

    const options = useMemo(
      () =>
        selectedClassFactories.map((factory) => {
          const assetType = getAssetTypeFromFactoryTypeId(factory.typeId);
          return {
            value: assetType,
            label: getAssetTypeFromFactoryTypeId(factory.typeId),
            description: t(`asset-types:types.${assetType}.description`),
          };
        }),
      [selectedClassFactories, t]
    );

    return (
      <>
        <DialogHeader className="text-center mt-10">
          <DialogTitle className="text-2xl text-center">
            {t("asset-types:whichAssetType")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("asset-types:assetTypeDifferences")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 mb-10">
          <form.AppField
            name="assetType"
            children={(field) => (
              <field.RadioField options={options} variant="card" />
            )}
          />
        </div>

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
