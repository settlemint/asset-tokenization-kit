import type { AssetDesignerFormInputData } from "@/components/asset-designer/shared-form";
import {
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/shared-form";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { basisPoints } from "@/lib/zod/validators/basis-points";
import { useTranslation } from "react-i18next";

export const AssetBasics = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation(["asset-designer"]);

    return (
      <>
        <form.Subscribe
          selector={(state) => state.values.type}
          children={(assetType) => (
            <>
              <form.AppField
                name="name"
                children={(field) => (
                  <field.TextField
                    label={t("form.fields.name.label")}
                    required={isRequiredField("name")}
                  />
                )}
              />
              <form.AppField
                name="symbol"
                children={(field) => (
                  <field.TextField
                    label={t("form.fields.symbol.label")}
                    required={isRequiredField("symbol")}
                  />
                )}
              />
              <form.AppField
                name="decimals"
                children={(field) => (
                  <field.NumberField
                    label={t("form.fields.decimals.label")}
                    required={isRequiredField("decimals")}
                  />
                )}
              />
              <form.AppField
                name="isin"
                children={(field) => (
                  <field.TextField
                    label={t("form.fields.isin.label")}
                    required={isRequiredField("isin")}
                  />
                )}
              />
              {assetType === AssetTypeEnum.bond && <BondBasics form={form} />}
              {assetType === AssetTypeEnum.fund && <FundBasics form={form} />}
            </>
          )}
        />
        <form.Subscribe
          selector={(state) => state.values}
          children={(_values) => {
            const fields: KeysOfUnion<AssetDesignerFormInputData>[] = [
              "name",
              "symbol",
              "decimals",
              "isin",
              "cap",
              "faceValue",
              "managementFeeBps",
            ];

            const disabled = fields.some((field) => {
              const meta = form.getFieldMeta(field);
              if (meta === undefined) {
                return true;
              }
              const errors = meta.errors;
              const isPristine = meta.isPristine;
              const isRequired = isRequiredField(field);
              const requiredFieldPristine = isRequired && isPristine;
              return errors.length > 0 || requiredFieldPristine;
            });

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

const BondBasics = withForm({
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
      </>
    );
  },
});

const FundBasics = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);
    return (
      <>
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
      </>
    );
  },
});
