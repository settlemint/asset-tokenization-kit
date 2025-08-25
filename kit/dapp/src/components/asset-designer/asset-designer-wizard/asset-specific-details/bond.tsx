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
    const { t } = useTranslation(["asset-designer", "asset-types"]);

    return (
      <>
        <form.AppField
          name="cap"
          children={(field) => (
            <field.BigIntField
              label={t("form.fields.cap.label")}
              required={isRequiredField("cap")}
              description={t("form.fields.cap.description", {
                type: t(`asset-types:types.bond.nameLowercasePlural`),
              })}
            />
          )}
        />
        <form.AppField
          name="faceValue"
          children={(field) => (
            <field.BigIntField
              label={t("form.fields.faceValue.label")}
              required={isRequiredField("faceValue")}
              description={t("form.fields.faceValue.description", {
                type: t(`asset-types:types.bond.nameLowercaseSingular`),
              })}
            />
          )}
        />
        <form.AppField
          name="maturityDate"
          children={(field) => (
            <field.DateTimeField
              label={t("form.fields.maturityDate.label")}
              required={isRequiredField("maturityDate")}
              description={t("form.fields.maturityDate.description", {
                type: t(`asset-types:types.bond.nameLowercaseSingular`),
              })}
              minDate={new Date()}
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
                      description={t(
                        "form.fields.denominationAsset.description",
                        {
                          type: t(
                            `asset-types:types.bond.nameLowercaseSingular`
                          ),
                        }
                      )}
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
                      description={t(
                        "form.fields.denominationAsset.description",
                        {
                          type: t(
                            `asset-types:types.bond.nameLowercaseSingular`
                          ),
                        }
                      )}
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
