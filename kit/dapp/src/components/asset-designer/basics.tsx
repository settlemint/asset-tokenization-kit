import { formOpts } from "@/components/asset-designer/shared-form";
import { withForm } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

export const Basics = withForm({
  ...formOpts,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);
    const assetType = useStore(form.store, (state) => state.values.type);

    return (
      <>
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField label={t("form.fields.name.label")} />
          )}
        />
        <form.AppField
          name="symbol"
          children={(field) => (
            <field.TextField label={t("form.fields.symbol.label")} />
          )}
        />
        <form.AppField
          name="decimals"
          children={(field) => (
            <field.TextField label={t("form.fields.decimals.label")} />
          )}
        />
        <form.AppField
          name="isin"
          children={(field) => (
            <field.TextField label={t("form.fields.isin.label")} />
          )}
        />
        {assetType === "bond" && <BondBasics form={form} />}
        {assetType === "fund" && <FundBasics form={form} />}
      </>
    );
  },
});

const BondBasics = withForm({
  ...formOpts,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);

    return (
      <>
        <form.AppField
          name="cap"
          children={(field) => (
            <field.TextField label={t("form.fields.cap.label")} />
          )}
        />
        <form.AppField
          name="faceValue"
          children={(field) => (
            <field.TextField label={t("form.fields.faceValue.label")} />
          )}
        />
      </>
    );
  },
});

const FundBasics = withForm({
  ...formOpts,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);
    return (
      <>
        <form.AppField
          name="managementFeeBps"
          children={(field) => (
            <field.TextField label={t("form.fields.managementFeeBps.label")} />
          )}
        />
      </>
    );
  },
});
