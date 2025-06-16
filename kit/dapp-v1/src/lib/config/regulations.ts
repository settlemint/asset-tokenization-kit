/**
 * Configuration for available regulations that can be applied to assets
 */
import { type AssetType, AssetTypeEnum } from "@/lib/utils/typebox/asset-types";

/**
 * Available regions for regulations
 */
export const Region = {
  EU: "European Union",
} as const;

export type Region = (typeof Region)[keyof typeof Region];

/**
 * Interface for regulation configuration
 *
 * Note: The nameKey and descriptionKey properties should be used as translation keys
 * with next-intl. For example, if nameKey is "regulations.mica.name", you would use
 * it in a component like: t("regulations.mica.name")
 */
export interface Regulation {
  /** Unique ID of the regulation */
  id: string;
  /** Translation key for the name of the regulation */
  nameKey: string;
  /** Asset types this regulation can be applied to */
  assetTypes: AssetType[];
  /** Geographical regions where this regulation applies */
  regions: Region[];
  /** Translation key for the description of the regulation */
  descriptionKey: string;
  /** Link to official documentation */
  documentationUrl: string;
}

/**
 * Available regulations configuration
 *
 * Usage with translations:
 * ```tsx
 * import { useTranslations } from 'next-intl';
 *
 * function RegulationItem({ regulation }: { regulation: Regulation }) {
 *   const t = useTranslations();
 *
 *   return (
 *     <div>
 *       <h3>{t(regulation.nameKey)}</h3>
 *       <p>{t(regulation.descriptionKey)}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const regulations: Regulation[] = [
  {
    id: "mica",
    nameKey: "regulations.mica.name",
    assetTypes: [AssetTypeEnum.stablecoin],
    regions: [Region.EU],
    descriptionKey: "regulations.mica.description",
    documentationUrl:
      "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114",
  },
];

/**
 * Get regulations applicable to a specific asset type
 */
export function getRegulationsForAssetType(assetType: AssetType): Regulation[] {
  return regulations.filter((regulation) =>
    regulation.assetTypes.includes(assetType)
  );
}

/**
 * Get regulations applicable to a specific region
 */
export function getRegulationsForRegion(region: Region): Regulation[] {
  return regulations.filter((regulation) =>
    regulation.regions.includes(region)
  );
}
