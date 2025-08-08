import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { withForm } from "@/hooks/use-app-form";
import type { KeysOfUnion } from "@/lib/utils/union";
import { useTranslation } from "react-i18next";

export const bondFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "cap",
  "faceValue",
  "maturityDate",
  "denominationAsset",
];

export const BondFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);

    return (
      <>
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
        <AddressSelectOrInputToggle
          children={({ mode }) => (
            <>
              {mode === "select" && (
                <form.AppField
                  name="denominationAsset"
                  children={(field) => (
                    <field.AddressSelectField
                      scope="asset"
                      label={t("form.fields.denominationAsset.label")}
                      required={isRequiredField("denominationAsset")}
                    />
                  )}
                />
              )}
              {mode === "manual" && (
                <form.AppField
                  name="denominationAsset"
                  children={(field) => (
                    <field.AddressInputField
                      label={t("form.fields.denominationAsset.label")}
                      required={isRequiredField("denominationAsset")}
                    />
                  )}
                />
              )}
            </>
          )}
        />
      </>
    );
  },
});
