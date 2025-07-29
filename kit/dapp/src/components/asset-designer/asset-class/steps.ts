import type { Step } from "@/components/stepper/types";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const steps = ["assetClass", "assetType"] as const;

export const AssetClassSelectionStepsSchema = z.enum(steps);
export type AssetClassSelectionStepsType = z.infer<
  typeof AssetClassSelectionStepsSchema
>;
export function useAssetClassSelectionSteps(): Step<AssetClassSelectionStepsType>[] {
  const { t } = useTranslation(["asset-class", "asset-types"]);

  return [
    {
      step: 1,
      id: "assetClass",
      label: t("asset-class:whichAssetClass"),
      description: t("asset-class:assetClassDifferences"),
    },
    {
      step: 2,
      id: "assetType",
      label: t("asset-types:whichAssetType"),
      description: t("asset-types:assetTypeDifferences"),
    },
  ];
}
