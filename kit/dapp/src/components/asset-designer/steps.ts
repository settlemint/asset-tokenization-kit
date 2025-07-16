import type { Step } from "@/components/stepper/types";
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

export const steps: Step<AssetDesignerStepsType>[] = [
  {
    id: 1,
    name: "selectAssetType",
    label: "Select Asset Type",
    description: "Select the type of asset you want to create",
  },
  {
    id: 2,
    name: "assetBasics",
    label: "Asset Basics",
    description: "Enter the basic details of the asset",
  },
  {
    id: 3,
    name: "summary",
    label: "Summary",
    description: "Review the details of the asset",
  },
];
