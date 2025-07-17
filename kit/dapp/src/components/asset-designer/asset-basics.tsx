import type { FormGroupProps } from "@/components/multistep-form-v2/types";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/use-app-form";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { useTranslation } from "react-i18next";
import type { AssetDesignerFormData } from "./shared-form";

export const AssetBasics = ({
  store,
  onGroupSubmit,
}: FormGroupProps<AssetDesignerFormData>) => {
  const type = store.state.type;
  const form = useAppForm({
    defaultValues: store.state,
    onSubmit: ({ value }) => {
      store.setState((state) => ({ ...state, ...value }));
      onGroupSubmit(value);
    },
  });

  const { t } = useTranslation(["asset-designer"]);

  return (
    <form.AppForm>
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

      {/* Conditional fields based on asset type from store */}
      <form.Subscribe
        selector={(state) => state.values}
        children={() => {
          if (type === AssetTypeEnum.bond) {
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
          }
          if (type === AssetTypeEnum.fund) {
            return (
              <>
                <form.AppField
                  name="managementFeeBps"
                  children={(field) => (
                    <field.TextField
                      label={t("form.fields.managementFeeBps.label")}
                    />
                  )}
                />
              </>
            );
          }
          return null;
        }}
      />

      <Button onClick={async () => form.handleSubmit()}>Create Asset</Button>
    </form.AppForm>
  );
};
