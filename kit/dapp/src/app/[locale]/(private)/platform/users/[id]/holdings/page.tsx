import UserAssetsTable from '@/components/blocks/user-assets-table/user-assets-table';
import { getUserDetail } from '@/lib/queries/user/user-detail';
import { getTranslations } from 'next-intl/server';

interface UserHoldingsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function UserHoldingsPage({
  params,
}: UserHoldingsPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'private.users.holdings',
  });
  const user = await getUserDetail({ id });

  return <UserAssetsTable wallet={user.wallet} title={t('title')} />;
}
