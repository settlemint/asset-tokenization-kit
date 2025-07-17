import { AssetBasics } from "@/components/asset-designer/asset-basics";
import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import type { AssetDesignerStepsType } from "@/components/asset-designer/steps";
import { useAppForm } from "@/hooks/use-app-form";
import type { JSX } from "react";

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
          const stepComponent: Record<AssetDesignerStepsType, JSX.Element> = {
            selectAssetType: <SelectAssetType form={form} />,
            assetBasics: <AssetBasics form={form} />,
            summary: <div>Summary</div>,
          };

          return stepComponent[step];
        }}
      </form.Subscribe>
    </form.AppForm>
  );
};
