import { RelatedGrid } from '@/components/blocks/related-grid/related-grid';
import { RelatedGridItem } from '@/components/blocks/related-grid/related-grid-item';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { BurnForm } from '../../../_components/manage-dropdown/burn-form/form';
import { MintForm } from '../../../_components/manage-dropdown/mint-form/form';
import { UpdateCollateralForm } from '../../../_components/manage-dropdown/update-collateral-form/form';

interface StablecoinsRelatedProps {
  address: Address;
  totalSupply: number;
}

export async function StablecoinsRelated({
  address,
  totalSupply,
}: StablecoinsRelatedProps) {
  const t = await getTranslations('private.assets.details.related');

  return (
    <RelatedGrid title={t('title')}>
      <RelatedGridItem
        title={t('stablecoins.update-collateral.title')}
        description={t('stablecoins.update-collateral.description')}
      >
        <UpdateCollateralForm
          address={address}
          assettype="stablecoin"
          asButton
        />
      </RelatedGridItem>
      <RelatedGridItem
        title={t('stablecoins.increase-supply.title')}
        description={t('stablecoins.increase-supply.description')}
      >
        <MintForm address={address} assettype="stablecoin" asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t('stablecoins.decrease-supply.title')}
        description={t('stablecoins.decrease-supply.description')}
      >
        <BurnForm
          address={address}
          balance={totalSupply}
          assettype="stablecoin"
          asButton
        />
      </RelatedGridItem>
    </RelatedGrid>
  );
}
