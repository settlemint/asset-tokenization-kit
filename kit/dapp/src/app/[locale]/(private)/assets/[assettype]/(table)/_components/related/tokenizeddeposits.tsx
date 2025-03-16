import { CreateTokenizedDepositForm } from '@/components/blocks/create-forms/tokenized-deposits/form';
import { RelatedGrid } from '@/components/blocks/related-grid/related-grid';
import { RelatedGridItem } from '@/components/blocks/related-grid/related-grid-item';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export async function TokenizedDepositsRelated() {
  const t = await getTranslations('private.assets.table.related');

  return (
    <RelatedGrid title={t('title')}>
      <RelatedGridItem
        title={t('tokenizeddeposits.issue-new.title')}
        description={t('tokenizeddeposits.issue-new.description')}
      >
        <CreateTokenizedDepositForm asButton />
      </RelatedGridItem>
      <RelatedGridItem
        title={t('tokenizeddeposits.mechanics.title')}
        description={t('tokenizeddeposits.mechanics.description')}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#contract-features-and-capabilities">
          <Button variant="secondary">
            {t('tokenizeddeposits.mechanics.button')}
          </Button>
        </Link>
      </RelatedGridItem>
      <RelatedGridItem
        title={t('tokenizeddeposits.usecases.title')}
        description={t('tokenizeddeposits.usecases.description')}
      >
        <Link href="https://console.settlemint.com/documentation/building-with-settlemint/kits/asset-tokenization/contracts/stablecoin#why-digital-fund-tokens">
          <Button variant="secondary">
            {t('tokenizeddeposits.usecases.button')}
          </Button>
        </Link>
      </RelatedGridItem>
    </RelatedGrid>
  );
}
