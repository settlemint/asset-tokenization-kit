import { Badge } from "@/components/ui/badge";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { withForm } from "@/hooks/use-app-form";
import { useAssetClass } from "@/hooks/use-asset-class";
import { noop } from "@/lib/utils/noop";
import { getAssetTypeFromFactoryTypeId } from "@/lib/zod/validators/asset-types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { assetClassSelectionFormOptions } from "./asset-class-form";

export const SelectAssetClass = withForm({
  ...assetClassSelectionFormOptions,
  props: {
    onStepSubmit: noop,
    onCancel: noop,
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
              <field.RadioField
                options={options}
                variant="card"
                onSelect={() => {
                  onStepSubmit();
                }}
              />
            )}
          />
        </div>
      </>
    );
  },
});
