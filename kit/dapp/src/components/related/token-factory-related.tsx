import {
  RelatedGrid,
  RelatedGridContent,
  RelatedGridItem,
  RelatedGridItemContent,
  RelatedGridItemDescription,
  RelatedGridItemFooter,
  RelatedGridItemTitle,
} from "@/components/related/related-grid";
import { Button } from "@/components/ui/button";
import type { AssetType } from "@atk/zod/asset-types";
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

  // TODO: Uncomment this when we have implemented the factory related actions
  return (
    <RelatedGrid style={{ display: "none" }}>
      <RelatedGridContent columns={3} animate>
        <RelatedGridItem>
          <RelatedGridItemContent>
            <RelatedGridItemTitle>
              {t(`factory.related.${assetType}.box1.title`)}
            </RelatedGridItemTitle>
            <RelatedGridItemDescription>
              {t(`factory.related.${assetType}.box1.description`)}
            </RelatedGridItemDescription>
          </RelatedGridItemContent>
          <RelatedGridItemFooter>
            <Button variant="outline" size="sm" className="press-effect">
              {t(`factory.related.${assetType}.box1.button`)}
            </Button>
          </RelatedGridItemFooter>
        </RelatedGridItem>

        <RelatedGridItem>
          <RelatedGridItemContent>
            <RelatedGridItemTitle>
              {t(`factory.related.${assetType}.box2.title`)}
            </RelatedGridItemTitle>
            <RelatedGridItemDescription>
              {t(`factory.related.${assetType}.box2.description`)}
            </RelatedGridItemDescription>
          </RelatedGridItemContent>
          <RelatedGridItemFooter>
            <Button variant="outline" size="sm" className="press-effect">
              {t(`factory.related.${assetType}.box2.button`)}
            </Button>
          </RelatedGridItemFooter>
        </RelatedGridItem>

        <RelatedGridItem>
          <RelatedGridItemContent>
            <RelatedGridItemTitle>
              {t(`factory.related.${assetType}.box3.title`)}
            </RelatedGridItemTitle>
            <RelatedGridItemDescription>
              {t(`factory.related.${assetType}.box3.description`)}
            </RelatedGridItemDescription>
          </RelatedGridItemContent>
          <RelatedGridItemFooter>
            <Button variant="outline" size="sm" className="press-effect">
              {t(`factory.related.${assetType}.box3.button`)}
            </Button>
          </RelatedGridItemFooter>
        </RelatedGridItem>
      </RelatedGridContent>
    </RelatedGrid>
  );
}
