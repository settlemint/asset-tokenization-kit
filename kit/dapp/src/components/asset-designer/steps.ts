import type { AssetDesignerSteps } from "@/components/asset-designer/steps-schema";

export const assetDesignerSteps: Record<
  AssetDesignerSteps,
  {
    nextStep: AssetDesignerSteps;
  }
> = {
  selectAssetType: {
    nextStep: "assetBasics",
  },
  assetBasics: {
    nextStep: "summary",
  },
  summary: {
    nextStep: "summary",
  },
};
