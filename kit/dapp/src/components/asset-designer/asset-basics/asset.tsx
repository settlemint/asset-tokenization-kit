import { BondBasics } from "@/components/asset-designer/asset-basics/bond";
import { CommonBasics } from "@/components/asset-designer/asset-basics/common";
import { FundBasics } from "@/components/asset-designer/asset-basics/fund";
import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { useStore } from "@tanstack/react-form";

export const AssetBasics = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const assetType = useStore(form.store, (state) => state.values.type);

    if (assetType === "bond") {
      return <BondBasics form={form} onStepSubmit={onStepSubmit} />;
    }
    if (assetType === "fund") {
      return <FundBasics form={form} onStepSubmit={onStepSubmit} />;
    }

    return <CommonBasics form={form} onStepSubmit={onStepSubmit} />;
  },
});
