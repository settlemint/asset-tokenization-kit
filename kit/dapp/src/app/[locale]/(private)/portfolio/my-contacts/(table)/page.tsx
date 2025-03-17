import MyContactsTable from '@/components/blocks/my-contacts-table/my-contacts-table';
import { PageHeader } from '@/components/layout/page-header';
import { getUser } from '@/lib/auth/utils';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { MyContactsActions } from './_components/actions';

export default async function MyContactsPage() {
  const t = await getTranslations('portfolio.my-contacts');
  const user = await getUser();

  return (
    <>
      <PageHeader
        title={t('title')}
        section={t('description')}
        button={<MyContactsActions />}
      />
      <MyContactsTable wallet={user.wallet as Address} title={t('title')} />
    </>
  );
}
