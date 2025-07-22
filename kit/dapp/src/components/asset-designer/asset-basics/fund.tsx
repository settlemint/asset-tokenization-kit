import {
  commonFields,
  CommonFields,
} from "@/components/asset-designer/asset-basics/common";
import type { AssetDesignerFormInputData } from "@/components/asset-designer/shared-form";
import {
  isRequiredField,
  isStepSubmitDisabled,
} from "@/components/asset-designer/shared-form";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { basisPoints } from "@/lib/zod/validators/basis-points";
import { useTranslation } from "react-i18next";

export const FundBasics = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation(["asset-designer"]);
    return (
      <>
        <CommonFields form={form} />
        <form.AppField
          name="managementFeeBps"
          validators={{
            onChange: basisPoints(),
          }}
          children={(field) => (
            <field.NumberField
              label={t("form.fields.managementFeeBps.label")}
              postfix="bps"
              required={isRequiredField("managementFeeBps")}
            />
          )}
        />
        <form.Subscribe
          selector={(state) => state.values}
          children={(_values) => {
            const fields: KeysOfUnion<AssetDesignerFormInputData>[] = [
              ...commonFields,
              "managementFeeBps",
            ];
            const disabled = isStepSubmitDisabled(fields, form);

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
