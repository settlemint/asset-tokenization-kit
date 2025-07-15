import { AssetBasicsSchema } from "@/components/asset-designer/asset-basics";
import { SelectAssetTypeSchema } from "@/components/asset-designer/select-asset-type";
import { z } from "zod";

export const AssetDesignerSteps = [
  "selectAssetType",
  "assetBasics",
  "summary",
] as const;

const AssetDesignerStepsSchema = z.enum(AssetDesignerSteps);
type AssetDesignerSteps = z.infer<typeof AssetDesignerStepsSchema>;

export const AssetDesignerStepSchema = z.object({
  step: AssetDesignerStepsSchema,
});

export const stepToSchema: Record<
  AssetDesignerSteps,
  {
    schema: z.ZodType;
  }
> = {
  selectAssetType: {
    schema: SelectAssetTypeSchema,
  },
  assetBasics: {
    schema: AssetBasicsSchema,
  },
  summary: {
    schema: z.object({}),
  },
};
