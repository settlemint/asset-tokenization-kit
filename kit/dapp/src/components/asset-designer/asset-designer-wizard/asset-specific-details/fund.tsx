import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { withForm } from "@/hooks/use-app-form";
import { formatValue } from "@/lib/utils/format-value";
import type { KeysOfUnion } from "@/lib/utils/union";
import { basisPointsToPercentage } from "@/lib/zod/validators/basis-points";
import { useTranslation } from "react-i18next";

export const fundFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "managementFeeBps",
];

export const FundFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);

    return (
      <>
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
