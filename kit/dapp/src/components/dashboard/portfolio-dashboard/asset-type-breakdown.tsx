import type { StatsPortfolioDetailsTokenFactoryBreakdown } from "@/orpc/routes/system/stats/routes/portfolio-details.schema";
import type { AssetType } from "@atk/zod/asset-types";
import { useTranslation } from "react-i18next";

/**
 * Groups token factory breakdown data by asset type and formats as readable text
 *
 * Why group by asset type: Users want to see the distribution across asset categories
 * (bonds, deposits, etc.) rather than individual token factories, which provides
 * a clearer high-level portfolio composition view.
 *
 * @param breakdown - Array of token factory breakdown data from portfolio API
 * @returns Formatted string like "2 bonds, 1 deposit" or empty string if no assets
 */
export function useAssetTypeBreakdown(
  breakdown: StatsPortfolioDetailsTokenFactoryBreakdown[]
): string {
  const { t } = useTranslation("asset-types");

  /**
   * Group breakdown by asset type and count factories per type
   *
   * Why use Map: Provides efficient lookup and iteration while maintaining
   * insertion order for consistent output formatting
   */
  const assetTypeCounts = breakdown.reduce<Map<AssetType, number>>(
    (acc, factory) => {
      const currentCount = acc.get(factory.assetType) ?? 0;
      acc.set(factory.assetType, currentCount + 1);
      return acc;
    },
    new Map()
  );

  /**
   * Format counts into readable text segments
   *
   * Why use singular/plural forms from i18n: Ensures correct pluralization rules
   * for all supported languages (English, German, Japanese, Arabic).
   * Uses singular form when count is 1, plural otherwise.
   */
  const segments = [...assetTypeCounts.entries()].map(([assetType, count]) => {
    const nameKey =
      count === 1
        ? (`types.${assetType}.nameLowercaseSingular` as const)
        : (`types.${assetType}.nameLowercasePlural` as const);
    const name = t(nameKey);
    return `${count} ${name}`;
  });

  /**
   * Join segments with commas
   *
   * Why comma-separated: Matches common UI pattern for listing multiple
   * items inline (e.g., "3 assets • 2 bonds, 1 deposit")
   */
  return segments.join(", ");
}

/**
 * Component that displays formatted asset type breakdown text
 *
 * Separates presentation from logic to enable reuse across different
 * UI contexts (cards, headers, tooltips) while maintaining consistent formatting
 */
export function AssetTypeBreakdown({
  breakdown,
}: {
  breakdown: StatsPortfolioDetailsTokenFactoryBreakdown[];
}) {
  const formattedBreakdown = useAssetTypeBreakdown(breakdown);

  if (!formattedBreakdown) {
    return null;
  }

  return <span>{formattedBreakdown}</span>;
}
