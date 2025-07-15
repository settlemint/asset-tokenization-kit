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
      onChange: AssetDesignerFormSchema,
    },
  });
  return (
    <form.AppForm>
      <SelectAssetType form={form} />
    </form.AppForm>
  );
};
