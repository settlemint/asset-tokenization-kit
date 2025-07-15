import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { stepToSchema } from "@/components/asset-designer/steps";
import { useAppForm } from "@/hooks/use-app-form";

export const AssetDesignerForm = () => {
  const form = useAppForm({
    ...assetDesignerFormOptions,
    validators: {
      onChange: (values) => {
        const schema = stepToSchema[values.value.step].schema;
        const parseResult = schema.safeParse(values.value);
        return parseResult.success;
      },
    },
  });

  return (
    <form
      action={async () => {
        await form.handleSubmit();
      }}
    >
      <SelectAssetType form={form} />
    </form>
  );
};
