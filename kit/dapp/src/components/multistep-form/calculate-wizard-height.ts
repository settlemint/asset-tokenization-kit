import { createLogger } from "@settlemint/sdk-utils/logging";
import type { StepDefinition, StepGroup } from "./types";

const logger = createLogger();

interface HeightCalculationConfig {
  baseHeight?: number;
  stepHeight?: number;
  groupHeaderHeight?: number;
  spacingPadding?: number;
  minHeight?: number;
  maxHeight?: number;
}

const DEFAULT_CONFIG: Required<HeightCalculationConfig> = {
  baseHeight: 300,
  stepHeight: 100,
  groupHeaderHeight: 80,
  spacingPadding: 100,
  minHeight: 500, // Reduced for mobile
  maxHeight: 800, // More conservative max height
};

/**
 * Calculates optimal wizard height based on content structure.
 *
 * When groups exist, height is based on the largest group's expanded state
 * rather than total steps, since only one group is expanded at a time.
 *
 * @example
 * // Simple wizard with 5 steps, no groups
 * calculateWizardHeight(steps) // Returns 900px
 *
 * // Since only one group is expanded at a time, the height is based on the largest group's expanded state, not the total
 * const groups = [
 *   { id: "basic", title: "Basic Info" }, // 3 steps
 *   { id: "advanced", title: "Advanced" } // 7 steps
 * ];
 * calculateWizardHeight(steps, groups) // Returns 960px (based on 7-step group)
 */
export function calculateWizardHeight<T>(
  steps: StepDefinition<T>[],
  groups?: StepGroup[],
  config?: HeightCalculationConfig
): number {
  const {
    baseHeight,
    stepHeight,
    groupHeaderHeight,
    spacingPadding,
    minHeight,
    maxHeight,
  } = { ...DEFAULT_CONFIG, ...config };

  // Add aggressive responsive buffer for larger screens to prevent marginal overflow
  const isLargeScreen =
    typeof window !== "undefined" && window.innerWidth >= 1024;
  const responsiveBuffer = isLargeScreen ? 40 : 0;

  if (!groups || groups.length === 0) {
    return Math.min(
      Math.max(
        baseHeight +
          steps.length * stepHeight +
          spacingPadding +
          responsiveBuffer,
        minHeight
      ),
      maxHeight
    );
  }

  // Find the largest group since only one group is expanded at a time
  const maxGroupSize =
    groups.length > 0
      ? Math.max(
          ...groups.map((group) => {
            const groupSteps = steps.filter(
              (step) => step.groupId === group.id
            );
            return groupSteps.length;
          })
        )
      : 0;

  const totalGroupHeaders = groups.length * groupHeaderHeight;
  const maxGroupContent = maxGroupSize * stepHeight;
  const calculatedHeight =
    baseHeight +
    totalGroupHeaders +
    maxGroupContent +
    spacingPadding +
    responsiveBuffer;
  const finalHeight = Math.min(
    Math.max(calculatedHeight, minHeight),
    maxHeight
  );

  logger.debug("Dynamic height calculation", {
    baseHeight,
    totalGroupHeaders,
    maxGroupContent,
    spacingPadding,
    calculatedHeight,
    finalHeight,
    groupsCount: groups.length,
    maxGroupSize,
    totalSteps: steps.length,
  });

  return finalHeight;
}
