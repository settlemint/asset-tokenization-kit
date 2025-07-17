import type { Step } from "@/components/stepper/types";
import { useTranslation } from "react-i18next";
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

/**
 * Hook that provides translated steps for the Asset Designer wizard.
 *
 * @returns Array of steps with translated labels and descriptions
 *
 * @example
 * ```tsx
 * function AssetDesignerWizard() {
 *   const steps = useAssetDesignerSteps();
 *
 *   return (
 *     <Stepper steps={steps} currentStep="selectAssetType" />
 *   );
 * }
 * ```
 */
export function useAssetDesignerSteps(): Step<AssetDesignerStepsType>[] {
  const { t } = useTranslation("asset-designer");

  return [
    {
      step: 1,
      id: "selectAssetType",
      label: t("wizard.steps.selectAssetType.title"),
      description: t("wizard.steps.selectAssetType.description"),
    },
    {
      step: 2,
      id: "assetBasics",
      label: t("wizard.steps.assetBasics.title"),
      description: t("wizard.steps.assetBasics.description"),
    },
    {
      step: 3,
      id: "summary",
      label: t("wizard.steps.summary.title"),
      description: t("wizard.steps.summary.description"),
    },
  ];
}
