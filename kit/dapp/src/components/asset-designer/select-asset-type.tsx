import {
  assetDesignerFormOptions,
  isRequiredField,
  onStepSubmit,
} from "@/components/asset-designer/shared-form";
import { withForm } from "@/hooks/use-app-form";
import { useSettings } from "@/hooks/use-settings";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import type { AssetDesignerFormInputData } from "./shared-form";

export const SelectAssetType = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);
    const [systemAddress] = useSettings("SYSTEM_ADDRESS");
    const { data: systemDetails } = useQuery({
      ...orpc.system.read.queryOptions({
        input: { id: systemAddress ?? "" },
      }),
      enabled: Boolean(systemAddress),
    });

    const options = useMemo(() => {
      // if (!systemDetails?.tokenFactories) return [];

      // const assetTypes = systemDetails.tokenFactories.map((factory) => {
      //   const factoryTypeId = factory.typeId as AssetFactoryTypeId;
      //   return getAssetTypeFromFactoryTypeId(factoryTypeId);
      // });

      return (["bond", "fund", "deposit", "stablecoin"] as const).map(
        (type) => ({
          value: type,
          label: t(`asset-types:${type}.name`),
          description: t(`asset-types:${type}.description`),
        })
      );
    }, [systemDetails, t]);

    return (
      <>
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
        <form.Subscribe
          selector={(state) => state.values}
          children={(_values) => {
            const fields: (keyof AssetDesignerFormInputData)[] = ["type"];

            const disabled = fields.some((field) => {
              const meta = form.getFieldMeta(field);
              const error = meta?.errors;
              const isPristine = meta?.isPristine;
              const requiredFieldPristine =
                isRequiredField(field) && isPristine;
              return (error && error.length > 0) || requiredFieldPristine;
            });

            return (
              <Button onClick={onStepSubmit} disabled={disabled}>
                Next
              </Button>
            );
          }}
        />
      </>
    );
  },
});
