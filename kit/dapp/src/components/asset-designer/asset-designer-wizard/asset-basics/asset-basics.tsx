import {
  assetDesignerFormOptions,
  isRequiredField,
  type AssetDesignerFormInputData,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import type { KeysOfUnion } from "@/lib/utils/union";
import { orpc } from "@/orpc/orpc-client";
import type { AssetType } from "@atk/zod/asset-types";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { from } from "dnum";
import { useTranslation } from "react-i18next";

const commonFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "name",
  "symbol",
  "decimals",
  "isin",
  "countryCode",
];

const hasBasePrice = (type: AssetType) => type !== "bond";

export const AssetBasics = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
    onBack: noop,
  },
  render: function Render({ form, onStepSubmit, onBack }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);
    const { data: baseCurrency } = useQuery(
      orpc.settings.read.queryOptions({ input: { key: "BASE_CURRENCY" } })
    );
    const type = useStore(form.store, (state) => state.values.type);
    return (
      <FormStepLayout
        title={t("wizard.steps.assetBasics.title")}
        description={t("wizard.steps.assetBasics.description")}
        actions={
          <>
            <Button variant="outline" onClick={onBack}>
              {t("form.buttons.back")}
            </Button>
            <form.StepSubmitButton
              label={t("form.buttons.next")}
              onStepSubmit={onStepSubmit}
              validate={
                hasBasePrice(type)
                  ? [...commonFields, "basePrice" as const]
                  : commonFields
              }
              checkRequiredFn={isRequiredField}
            />
          </>
        }
        asGrid
      >
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField
              label={t("form.fields.name.label")}
              required={isRequiredField("name")}
              description={t("form.fields.name.description", {
                type: t(
                  `asset-types:types.${form.state.values.type}.nameLowercaseSingular`
                ),
              })}
            />
          )}
        />
        <form.AppField
          name="symbol"
          children={(field) => (
            <field.TextField
              label={t("form.fields.symbol.label")}
              required={isRequiredField("symbol")}
              description={t("form.fields.symbol.description", {
                type: t(
                  `asset-types:types.${form.state.values.type}.nameLowercaseSingular`
                ),
              })}
            />
          )}
        />
        <form.AppField
          name="decimals"
          children={(field) => (
            <field.NumberField
              label={t("form.fields.decimals.label")}
              required={isRequiredField("decimals")}
              description={t("form.fields.decimals.description", {
                type: t(
                  `asset-types:types.${form.state.values.type}.nameLowercaseSingular`
                ),
              })}
            />
          )}
        />
        <form.AppField
          name="isin"
          children={(field) => (
            <field.TextField
              label={t("form.fields.isin.label")}
              required={isRequiredField("isin")}
              description={t("form.fields.isin.description", {
                type: t(
                  `asset-types:types.${form.state.values.type}.nameLowercaseSingular`
                ),
              })}
            />
          )}
        />
        {!hasBasePrice(type) && (
          <form.AppField
            name="basePrice"
            children={(field) => (
              <field.DnumField
                label={t("form.fields.basePrice.label")}
                required={isRequiredField("basePrice")}
                description={t("form.fields.basePrice.description", {
                  type: t(
                    `asset-types:types.${form.state.values.type}.nameLowercaseSingular`
                  ),
                })}
                endAddon={baseCurrency ?? ""}
                decimals={2}
                placeholder={from("1.00", 2)}
              />
            )}
          />
        )}
        <form.AppField
          name="countryCode"
          children={(field) => (
            <field.CountrySelectField
              label={t("form.fields.countryCode.label")}
              required={isRequiredField("countryCode")}
              valueType="numeric"
              description={t("form.fields.countryCode.description", {
                type: t(
                  `asset-types:types.${form.state.values.type}.nameLowercaseSingular`
                ),
              })}
            />
          )}
        />
      </FormStepLayout>
    );
  },
});
