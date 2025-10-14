import type { StepGroup } from "@/components/stepper/types";
import type { AssetType } from "@atk/zod/asset-types";
import { useTranslation } from "react-i18next";
import * as z from "zod";

export const AssetDesignerSteps = [
  "assetClass",
  "assetType",
  "assetBasics",
  "assetSpecificConfig",
  "complianceModules",
  "summary",
] as const;

export const AssetDesignerStepGroups = [
  "chooseAssetType",
  "configureAssetDetails",
  "compliance",
  "summary",
] as const;

const AssetDesignerStepsSchema = z.enum(AssetDesignerSteps);

export const AssetDesignerStepSchema = z.object({
  step: AssetDesignerStepsSchema,
});

const _AssetDesignerStepGroupsSchema = z.enum(AssetDesignerStepGroups);

export type AssetDesignerStepsType = z.infer<typeof AssetDesignerStepsSchema>;
export type AssetDesignerStepGroupsType = z.infer<
  typeof _AssetDesignerStepGroupsSchema
>;

interface UseAssetDesignerStepsReturn {
  stepsOrGroups: StepGroup<
    AssetDesignerStepsType,
    AssetDesignerStepGroupsType
  >[];
}

/**
 * Hook that provides translated grouped steps for the Asset Designer wizard.
 *
 * @returns Array of step groups with translated labels and descriptions
 *
 * @example
 * ```tsx
 * function AssetDesignerWizard() {
 *   const { stepsOrGroups } = useAssetDesignerSteps();
 *
 *   return (
 *     <Stepper stepsOrGroups={stepsOrGroups} currentStep="assetClass" />
 *   );
 * }
 * ```
 */
export function useAssetDesignerSteps({
  type,
}: {
  type: AssetType;
}): UseAssetDesignerStepsReturn {
  const { t } = useTranslation("asset-designer");

  const stepsOrGroups = [
    {
      id: "chooseAssetType",
      label: t("wizard.groups.chooseAssetType.title"),
      description: t("wizard.groups.chooseAssetType.description"),
      steps: [
        {
          id: "assetClass",
          label: t("wizard.steps.assetClass.title"),
          description: t("wizard.steps.assetClass.description"),
          step: 1,
        },
        {
          id: "assetType",
          label: t("wizard.steps.assetType.title"),
          description: t("wizard.steps.assetType.description"),
          step: 2,
        },
      ],
    },
    {
      id: "configureAssetDetails",
      label: t("wizard.groups.configureAssetDetails.title"),
      description: t("wizard.groups.configureAssetDetails.description"),
      steps: [
        {
          id: "assetBasics",
          label: t("wizard.steps.assetBasics.title"),
          description: t("wizard.steps.assetBasics.description"),
          step: 3,
        },
        ...(["bond", "fund", "equity"].includes(type)
          ? [
              {
                id: "assetSpecificConfig",
                label: t("wizard.steps.assetSpecificConfig.title"),
                description: t("wizard.steps.assetSpecificConfig.description", {
                  type,
                }),
                step: 4,
              } as const,
            ]
          : []),
      ],
    },
    {
      id: "compliance",
      label: t("wizard.groups.compliance.title"),
      description: t("wizard.groups.compliance.description"),
      steps: [
        {
          id: "complianceModules",
          label: t("wizard.steps.complianceModules.title"),
          description: t("wizard.steps.complianceModules.description"),
          step: 5,
        },
      ],
    },
    {
      id: "summary",
      label: t("wizard.groups.summary.title"),
      description: t("wizard.groups.summary.description"),
      steps: [
        {
          id: "summary",
          label: t("wizard.steps.summary.title"),
          description: t("wizard.steps.summary.description"),
          step: 6,
        },
      ],
    },
  ] as const satisfies StepGroup<
    AssetDesignerStepsType,
    AssetDesignerStepGroupsType
  >[];

  return {
    stepsOrGroups,
  };
}
