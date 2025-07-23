import {
  assetDesignerFormOptions,
  isRequiredField,
  type AssetDesignerFormInputData,
} from "@/components/asset-designer/shared-form";
import {
  FormStep,
  FormStepContent,
  FormStepSubmit,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { useSettings } from "@/hooks/use-settings";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const assetTypeFields: KeysOfUnion<AssetDesignerFormInputData>[] = ["type"];

export const SelectAssetType = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
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

      return (["bond", "deposit"] as const).map((type) => ({
        value: type,
        label: t(`asset-types:${type}.name`),
        description: t(`asset-types:${type}.description`),
      }));
    }, [systemDetails, t]);

    return (
      <FormStep>
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
            label="Next"
            onStepSubmit={onStepSubmit}
            validate={assetTypeFields}
            checkRequiredFn={isRequiredField}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
