import { z } from "zod";

export const AssetDesignerSteps = [
  "selectAssetType",
  "assetBasics",
  "summary",
] as const;

const AssetDesignerStepsSchema = z.enum(AssetDesignerSteps);
export type AssetDesignerSteps = z.infer<typeof AssetDesignerStepsSchema>;

export const AssetDesignerStepSchema = z.object({
  step: AssetDesignerStepsSchema,
});

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
