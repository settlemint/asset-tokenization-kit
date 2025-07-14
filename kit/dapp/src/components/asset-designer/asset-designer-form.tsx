import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import { formOpts } from "@/components/asset-designer/shared-form";
import { useAppForm } from "@/hooks/use-app-form";

export const AssetDesignerForm = () => {
  const form = useAppForm({
    ...formOpts,
  });
  return <SelectAssetType form={form} />;
};
