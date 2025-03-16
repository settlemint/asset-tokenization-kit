import { CreateCryptoCurrencyForm } from '@/app/[locale]/(private)/assets/xcryptocurrencies/_components/create-form/form';
import { RelatedGrid } from '@/components/blocks/related-grid/related-grid';
import { RelatedGridItem } from '@/components/blocks/related-grid/related-grid-item';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export async function CryptocurrenciesRelated() {
  const t = await getTranslations('private.assets.table.related');

  return (
    <RelatedGrid title={t('title')}>
      <RelatedGridItem
        title={t('cryptocurrencies.issue-new.title')}
        description={t('cryptocurrencies.issue-new.description')}
      >
        <CreateCryptoCurrencyForm asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t('cryptocurrencies.mechanics.title')}
        description={t('cryptocurrencies.mechanics.description')}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/cryptocurrency#contract-features-and-capabilities">
          <Button variant="secondary">
            {t('cryptocurrencies.mechanics.button')}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t('cryptocurrencies.usecases.title')}
        description={t('cryptocurrencies.usecases.description')}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/cryptocurrency#why-digital-fund-tokens">
          <Button variant="secondary">
            {t('cryptocurrencies.usecases.button')}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
