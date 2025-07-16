import type { AssetDesignerFormData } from "@/components/asset-designer/shared-form";
import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { assetDesignerSteps } from "@/components/asset-designer/steps";

import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { useTranslation } from "react-i18next";

export const BasicsSchema = TokenBaseSchema.pick({
  name: true,
  symbol: true,
  decimals: true,
  isin: true,
  type: true,
});

export const AssetBasics = withForm({
  ...assetDesignerFormOptions,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer"]);

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
        <Button
          onClick={() => {
            form.setFieldValue("step", assetDesignerSteps.assetBasics.nextStep);
          }}
        >
          Next
        </Button>
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
  defaultValues: {} as AssetDesignerFormData,
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
