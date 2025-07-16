import { z } from "zod";

export const AssetDesignerSteps = [
  "selectAssetType",
  "assetBasics",
  "summary",
] as const;

const AssetDesignerStepsSchema = z.enum(AssetDesignerSteps);
export type AssetDesignerStepsType = z.infer<typeof AssetDesignerStepsSchema>;

export const AssetDesignerStepSchema = z.object({
  step: AssetDesignerStepsSchema,
});

export const assetDesignerSteps: Record<
  AssetDesignerStepsType,
  {
    nextStep: AssetDesignerStepsType;
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
