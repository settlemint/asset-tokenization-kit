import { CreateStablecoinForm } from '@/components/blocks/create-forms/stablecoins/form';
import { RelatedGrid } from '@/components/blocks/related-grid/related-grid';
import { RelatedGridItem } from '@/components/blocks/related-grid/related-grid-item';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export async function StablecoinsRelated() {
  const t = await getTranslations('private.assets.table.related');

  return (
    <RelatedGrid title={t('title')}>
      <RelatedGridItem
        title={t('stablecoins.issue-new.title')}
        description={t('stablecoins.issue-new.description')}
      >
        <CreateStablecoinForm asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t('stablecoins.mechanics.title')}
        description={t('stablecoins.mechanics.description')}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#contract-features-and-capabilities">
          <Button variant="secondary">
            {t('stablecoins.mechanics.button')}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t('stablecoins.usecases.title')}
        description={t('stablecoins.usecases.description')}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#why-digital-fund-tokens">
          <Button variant="secondary">
            {t('stablecoins.usecases.button')}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
