import type { FormGroupProps } from "@/components/multistep-form-v2/types";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/use-app-form";
import { useSettings } from "@/hooks/use-settings";
import { assetType } from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const SelectAssetTypeFormSchema = z.object({ type: assetType() });

export type SelectAssetTypeFormData = z.infer<typeof SelectAssetTypeFormSchema>;

export const SelectAssetType = ({
  store,
  onGroupSubmit,
}: FormGroupProps<SelectAssetTypeFormData>) => {
  const form = useAppForm({
    defaultValues: {} as SelectAssetTypeFormData,
    validators: {
      onChange: SelectAssetTypeFormSchema,
      onSubmit: SelectAssetTypeFormSchema,
    },
    onSubmit: ({ value }) => {
      console.log("onSubmit", value);
      store.setState((state) => ({ ...state, ...value }));
      console.log("store", store.state);
      onGroupSubmit(value);
    },
  });

  const { t } = useTranslation(["asset-designer", "asset-types"]);
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: Boolean(systemAddress),
  });

  const options = useMemo(() => {
    // if (!systemDetails?.tokenFactories) return [];

    // const assetTypes = systemDetails.tokenFactories.map((factory) => {
    //   const factoryTypeId = factory.typeId as AssetFactoryTypeId;
    //   return getAssetTypeFromFactoryTypeId(factoryTypeId);
    // });

    return (["bond", "fund", "deposit", "stablecoin"] as const).map((type) => ({
      value: type,
      label: t(`asset-types:${type}.name`),
      description: t(`asset-types:${type}.description`),
    }));
  }, [systemDetails, t]);

  return (
    <form.AppForm>
      <form.AppField
        name="type"
        children={(field) => (
          <field.RadioField
            label={t("wizard.steps.asset-type.title")}
            options={options}
            variant="card"
          />
        )}
      />
      <form.Subscribe
        selector={(state) => ({
          isValid: state.isValid,
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
          isTouched: state.isTouched,
        })}
      >
        {({ isValid, canSubmit, isSubmitting, isTouched }) => (
          <Button
            disabled={!isValid || !canSubmit || isSubmitting || !isTouched}
            onClick={async () => {
              await form.handleSubmit();
            }}
          >
            Next
          </Button>
        )}
      </form.Subscribe>
    </form.AppForm>
  );
};
