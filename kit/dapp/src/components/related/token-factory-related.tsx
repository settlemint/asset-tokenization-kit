import { RelatedGrid } from "@/components/related/related-grid";
import { RelatedGridItem } from "@/components/related/related-grid-item";
import { Button } from "@/components/ui/button";
import type { AssetType } from "@/lib/zod/validators/asset-types";
import { useTranslation } from "react-i18next";

interface TokenFactoryRelatedProps {
  assetType: AssetType;
}

/**
 * Displays related documentation and resources for a specific token factory asset type
 *
 * This component shows three contextual information boxes with links to relevant
 * documentation based on the asset type. Each asset type has customized content
 * for getting started, compliance, and technical architecture.
 *
 * @param props - Component properties
 * @param props.assetType - The type of asset (bond, deposit, equity, fund, stablecoin)
 *
 * @example
 * ```tsx
 * <TokenFactoryRelated assetType="equity" />
 * ```
 */
export function TokenFactoryRelated({ assetType }: TokenFactoryRelatedProps) {
  const { t } = useTranslation("tokens");

  return (
    <RelatedGrid>
      <RelatedGridItem
        title={t(`factory.related.${assetType}.box1.title`)}
        description={t(`factory.related.${assetType}.box1.description`)}
      >
        <Button variant="outline" size="sm">
          {t(`factory.related.${assetType}.box1.button`)}
        </Button>
      </RelatedGridItem>
      <RelatedGridItem
        title={t(`factory.related.${assetType}.box2.title`)}
        description={t(`factory.related.${assetType}.box2.description`)}
      >
        <Button variant="outline" size="sm">
          {t(`factory.related.${assetType}.box2.button`)}
        </Button>
      </RelatedGridItem>
      <RelatedGridItem
        title={t(`factory.related.${assetType}.box3.title`)}
        description={t(`factory.related.${assetType}.box3.description`)}
      >
        <Button variant="outline" size="sm">
          {t(`factory.related.${assetType}.box3.button`)}
        </Button>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
