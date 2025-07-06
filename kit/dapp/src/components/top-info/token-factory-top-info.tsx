import { TopInfo } from "@/components/top-info/top-info";
import type { AssetType } from "@/lib/zod/validators/asset-types";
import { useTranslation } from "react-i18next";

interface TokenFactoryTopInfoProps {
  assetType: AssetType;
}

/**
 * Displays informational content about a specific token factory asset type
 *
 * This component shows asset-specific information to help users understand
 * the purpose and characteristics of each token type (bonds, deposits, equity, etc.)
 *
 * @param props - Component properties
 * @param props.assetType - The type of asset (bond, deposit, equity, fund, stablecoin)
 *
 * @example
 * ```tsx
 * <TokenFactoryTopInfo assetType="bond" />
 * ```
 */
export function TokenFactoryTopInfo({ assetType }: TokenFactoryTopInfoProps) {
  const { t } = useTranslation("tokens");

  return (
    <TopInfo title={t(`factory.info.${assetType}.title`)}>
      <p>{t(`factory.info.${assetType}.description`)}</p>
    </TopInfo>
  );
}
