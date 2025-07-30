import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/shared-form";
import {
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/asset-designer-wizard/shared-form";
import {
  FormStepContent,
  FormStepSubmit,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";

import { useTranslation } from "react-i18next";

export const commonFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "name",
  "symbol",
  "decimals",
  "isin",
  "countryCode",
];

export const CommonFields = withForm({
  ...assetDesignerFormOptions,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);

    return (
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
        <form.AppField
          name="countryCode"
          children={(field) => (
            <field.CountrySelectField
              label={t("form.fields.countryCode.label")}
              description={t("form.fields.countryCode.description")}
              required={isRequiredField("countryCode")}
              valueType="numeric"
            />
          )}
        />
      </>
    );
  },
});

export const CommonBasics = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation(["asset-designer"]);
    return (
      <>
        <FormStepContent>
          <CommonFields form={form} />
        </FormStepContent>

        <FormStepSubmit>
          <form.StepSubmitButton
            label={t("form.buttons.next")}
            onStepSubmit={onStepSubmit}
            validate={commonFields}
            checkRequiredFn={isRequiredField}
          />
        </FormStepSubmit>
      </>
    );
  },
});
