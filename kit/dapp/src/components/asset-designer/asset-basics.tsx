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
        <form.AppField
          name="name"
          validators={{
            onChange: z.string(),
          }}
          children={(field) => (
            <field.TextField
              label={t("form.fields.name.label")}
              required={isRequiredField("name")}
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
              required={isRequiredField("symbol")}
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
              required={isRequiredField("decimals")}
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
              required={isRequiredField("isin")}
            />
          )}
        />
        <form.Subscribe
          selector={(state) => state.values}
          children={(values) => {
            if (values.type === AssetTypeEnum.bond) {
              return <BondBasics form={form} />;
            }
            if (values.type === AssetTypeEnum.fund) {
              return <FundBasics form={form} />;
            }
            return null;
          }}
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
            ];

            const disabled = fields.some((field) => {
              const meta = form.getFieldMeta(field);
              const error = meta?.errors;
              const isPristine = meta?.isPristine;
              const requiredFieldPristine =
                isRequiredField(field) && isPristine;
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
              required={isRequiredField("cap")}
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
              required={isRequiredField("faceValue")}
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
              required={isRequiredField("managementFeeBps")}
            />
          )}
        />
      </>
    );
  },
});
