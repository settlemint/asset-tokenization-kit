import type { AssetDesignerFormInputData } from "@/components/asset-designer/shared-form";
import {
  assetDesignerFormOptions,
  isRequiredField,
  isStepSubmitDisabled,
} from "@/components/asset-designer/shared-form";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";

import { useTranslation } from "react-i18next";

export const commonFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "name",
  "symbol",
  "decimals",
  "isin",
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
    return (
      <>
        <CommonFields form={form} />
        <form.Subscribe
          selector={(state) => state.values}
          children={(_values) => {
            const disabled = isStepSubmitDisabled(commonFields, form);
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
