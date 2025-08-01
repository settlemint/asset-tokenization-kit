import {
  commonFields,
  CommonFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-basics/common";
import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/shared-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/shared-form";
import {
  FormStepContent,
  FormStepSubmit,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { useTranslation } from "react-i18next";

const bondFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  ...commonFields,
  "cap",
  "faceValue",
  "maturityDate",
  "underlyingAsset",
];

export const BondBasics = withForm({
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
          <form.AppField
            name="maturityDate"
            children={(field) => (
              <field.DateTimeField
                label={t("form.fields.maturityDate.label")}
                required={isRequiredField("maturityDate")}
              />
            )}
          />
          <form.AppField
            name="underlyingAsset"
            children={(field) => (
              <field.AddressSelectOrInputField
                scope="asset"
                label={t("form.fields.underlyingAsset.label")}
                required={isRequiredField("underlyingAsset")}
              />
            )}
          />
        </FormStepContent>
        <FormStepSubmit>
          <form.StepSubmitButton
            label={t("form.buttons.next")}
            onStepSubmit={onStepSubmit}
            validate={bondFields}
            checkRequiredFn={isRequiredField}
          />
        </FormStepSubmit>
      </>
    );
  },
});
