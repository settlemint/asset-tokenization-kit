import {
  commonFields,
  CommonFields,
} from "@/components/asset-designer/asset-basics/common";
import type { AssetDesignerFormInputData } from "@/components/asset-designer/shared-form";
import { isRequiredField } from "@/components/asset-designer/shared-form";
import {
  FormStepContent,
  FormStepSubmit,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { useTranslation } from "react-i18next";

const fundFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  ...commonFields,
  "managementFeeBps",
];

export const FundBasics = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation(["asset-designer"]);
    return (
      <>
        <FormStepContent>
          <CommonFields form={form} />
          <form.AppField
            name="managementFeeBps"
            children={(field) => (
              <field.NumberField
                label={t("form.fields.managementFeeBps.label")}
                postfix="bps"
                required={isRequiredField("managementFeeBps")}
              />
            )}
          />
        </FormStepContent>
        <FormStepSubmit>
          <form.StepSubmitButton
            label="Next"
            onStepSubmit={onStepSubmit}
            validate={fundFields}
            checkRequiredFn={isRequiredField}
          />
        </FormStepSubmit>
      </>
    );
  },
});
