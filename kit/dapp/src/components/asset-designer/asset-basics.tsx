import type { AssetDesignerFormData } from "@/components/asset-designer/shared-form";
import {
  assetDesignerFormOptions,
  isRequiredField,
  onStepSubmit,
} from "@/components/asset-designer/shared-form";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { assetSymbol } from "@/lib/zod/validators/asset-symbol";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { basisPoints } from "@/lib/zod/validators/basis-points";
import { isin } from "@/lib/zod/validators/isin";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const AssetBasics = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit,
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
                validators={{
                  onChange: z.string(),
                }}
                children={(field) => (
                  <field.TextField
                    label={t("form.fields.name.label")}
                    required={isRequiredField("name", assetType)}
                  />
                )}
              />
              <form.AppField
                name="symbol"
                validators={{
                  onChange: assetSymbol(),
                }}
                children={(field) => (
                  <field.TextField
                    label={t("form.fields.symbol.label")}
                    required={isRequiredField("symbol", assetType)}
                  />
                )}
              />
              <form.AppField
                name="decimals"
                validators={{
                  onChange: z.int().min(0).max(18),
                }}
                children={(field) => (
                  <field.NumberField
                    label={t("form.fields.decimals.label")}
                    required={isRequiredField("decimals", assetType)}
                  />
                )}
              />
              <form.AppField
                name="isin"
                validators={{
                  onChange: isin().optional(),
                }}
                children={(field) => (
                  <field.TextField
                    label={t("form.fields.isin.label")}
                    required={isRequiredField("isin", assetType)}
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
            const fields: (keyof typeof _values)[] = [
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
              const error = meta?.errors;
              const isPristine = meta?.isPristine;
              const requiredFieldPristine =
                isRequiredField(field, _values.type) && isPristine;
              return (error && error.length > 0) || requiredFieldPristine;
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
  defaultValues: {} as AssetDesignerFormData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);

    return (
      <>
        <form.AppField
          name="cap"
          validators={{
            onChange: z.bigint(),
          }}
          children={(field) => (
            <field.BigIntField
              label={t("form.fields.cap.label")}
              required={isRequiredField("cap", "bond")}
            />
          )}
        />
        <form.AppField
          name="faceValue"
          validators={{
            onChange: z.bigint(),
          }}
          children={(field) => (
            <field.BigIntField
              label={t("form.fields.faceValue.label")}
              required={isRequiredField("faceValue", "bond")}
            />
          )}
        />
      </>
    );
  },
});

const FundBasics = withForm({
  defaultValues: {} as AssetDesignerFormData,
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
              required={isRequiredField("managementFeeBps", "fund")}
            />
          )}
        />
      </>
    );
  },
});
