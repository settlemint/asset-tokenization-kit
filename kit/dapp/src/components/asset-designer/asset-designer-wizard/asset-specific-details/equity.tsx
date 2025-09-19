import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { withForm } from "@/hooks/use-app-form";
import type { KeysOfUnion } from "@/lib/utils/union";
import { useTranslation } from "react-i18next";

export const equityFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "class",
  "category",
];

export const EquityFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);

    return (
      <>
        {" "}
        <form.AppField
          name="category"
          children={(field) => (
            <field.AssetCategorySelectField
              label={t("form.fields.category.label")}
              description={t("form.fields.category.description", {
                type: t(`asset-types:types.equity.nameLowercaseSingular`),
              })}
              required={isRequiredField("category")}
              assetType="equity"
            />
          )}
        />
        <form.AppField
          name="class"
          children={(field) => (
            <field.AssetClassSelectField
              label={t("form.fields.class.label")}
              description={t("form.fields.class.description", {
                type: t(`asset-types:types.equity.nameLowercaseSingular`),
              })}
              required={isRequiredField("class")}
              assetType="equity"
            />
          )}
        />
      </>
    );
  },
});
