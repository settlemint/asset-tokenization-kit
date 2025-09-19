import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { withForm } from "@/hooks/use-app-form";
import { formatValue } from "@/lib/utils/format-value";
import type { KeysOfUnion } from "@/lib/utils/union";
import { basisPointsToPercentage } from "@atk/zod/basis-points";
import { useTranslation } from "react-i18next";

export const fundFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "managementFeeBps",
  "class",
  "category",
];

export const FundFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);

    return (
      <>
        <form.AppField
          name="category"
          children={(field) => (
            <field.AssetCategorySelectField
              label={t("form.fields.category.label")}
              description={t("form.fields.category.description", {
                type: t(`asset-types:types.fund.nameLowercaseSingular`),
              })}
              required={isRequiredField("category")}
              assetType="fund"
            />
          )}
        />
        <form.AppField
          name="class"
          children={(field) => (
            <field.AssetClassSelectField
              label={t("form.fields.class.label")}
              description={t("form.fields.class.description", {
                type: t(`asset-types:types.fund.nameLowercaseSingular`),
              })}
              required={isRequiredField("class")}
              assetType="fund"
            />
          )}
        />
        <div>
          <form.AppField
            name="managementFeeBps"
            children={(field) => (
              <field.NumberField
                label={t("form.fields.managementFeeBps.label")}
                endAddon="bps"
                required={isRequiredField("managementFeeBps")}
                description={t("form.fields.managementFeeBps.description", {
                  type: t(`asset-types:types.fund.nameLowercaseSingular`),
                })}
              />
            )}
          />
          <form.Subscribe
            selector={(state) => ({
              managementFeeBps:
                state.values.type === "fund" && state.errors?.length === 0
                  ? state.values.managementFeeBps
                  : undefined,
            })}
          >
            {({ managementFeeBps }) => {
              if (!managementFeeBps) return null;
              const percentage = formatValue(
                basisPointsToPercentage(managementFeeBps),
                {
                  type: "percentage",
                }
              );
              return managementFeeBps ? (
                <div className="ml-1 text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  {t("form.fields.managementFeeBps.inPercentage")} {percentage}
                </div>
              ) : null;
            }}
          </form.Subscribe>
        </div>
      </>
    );
  },
});
