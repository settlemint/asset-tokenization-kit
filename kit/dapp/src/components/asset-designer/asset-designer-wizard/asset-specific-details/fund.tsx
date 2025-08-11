import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { withForm } from "@/hooks/use-app-form";
import type { KeysOfUnion } from "@/lib/utils/union";
import { useTranslation } from "react-i18next";

export const fundFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "managementFeeBps",
];

export const FundFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);
    return (
      <>
        <form.AppField
          name="managementFeeBps"
          children={(field) => (
            <field.NumberField
              label={t("form.fields.managementFeeBps.label")}
              endAddon="bps"
              required={isRequiredField("managementFeeBps")}
            />
          )}
        />
      </>
    );
  },
});
