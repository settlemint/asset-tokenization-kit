import { AssetBasics } from "@/components/asset-designer/asset-basics";
import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import { useAppForm } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-store";

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
  const step = useStore(form.store, (state) => state.values.step);

  return (
    <form.AppForm>
      {step === "selectAssetType" && <SelectAssetType form={form} />}
      {step === "assetBasics" && <AssetBasics form={form} />}
      {step === "summary" && <div>Summary</div>}
    </form.AppForm>
  );
};
