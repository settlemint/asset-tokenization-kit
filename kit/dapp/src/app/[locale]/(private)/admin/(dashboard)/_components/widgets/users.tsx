'use client';

import { useUserCount } from '@/lib/queries/user/user-count';
import { startOfDay, subDays } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Widget } from './widget';

export function UsersWidget() {
  const t = useTranslations('admin.dashboard.widgets');
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { totalUsersCount, recentUsersCount },
  } = useUserCount({
    since: sevenDaysAgo,
  });

  return (
    <Widget
      label={t('users.label')}
      value={totalUsersCount.toLocaleString()}
      subtext={t('users.subtext', { count: recentUsersCount, days: 7 })}
    />
  );
}
