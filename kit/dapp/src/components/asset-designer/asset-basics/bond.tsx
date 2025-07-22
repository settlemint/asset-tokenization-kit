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
import { useTranslation } from "react-i18next";

export const BondBasics = withForm({
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
          name="cap"
          children={(field) => (
            <field.BigIntField
              label={t("form.fields.cap.label")}
              required={isRequiredField("cap")}
            />
          )}
        />
        <form.AppField
          name="faceValue"
          children={(field) => (
            <field.BigIntField
              label={t("form.fields.faceValue.label")}
              required={isRequiredField("faceValue")}
            />
          )}
        />
        <form.Subscribe
          selector={(state) => state.values}
          children={(_values) => {
            const fields: KeysOfUnion<AssetDesignerFormInputData>[] = [
              ...commonFields,
              "cap",
              "faceValue",
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
