import { AssetBasics } from "@/components/asset-designer/asset-basics";
import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import { useAppForm } from "@/hooks/use-app-form";

export const AssetDesignerForm = () => {
  const form = useAppForm({
    ...assetDesignerFormOptions,
    validators: {
      onChange: (values) => {
        try {
          const parseResult = AssetDesignerFormSchema.safeParse(values);
          return parseResult.success;
        } catch {
          return false;
        }
      },
    },
  });
  return (
    <form.AppForm>
      <form.Subscribe selector={(state) => state.values.step}>
        {(step) => {
          if (step === "selectAssetType")
            return <SelectAssetType form={form} />;
          if (step === "assetBasics") return <AssetBasics form={form} />;
          return <div>Summary</div>;
        }}
      </form.Subscribe>
    </form.AppForm>
  );
};
