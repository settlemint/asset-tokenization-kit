'use client';

import { useUserCount } from '@/lib/queries/user/user-count';
import { startOfDay, subDays } from 'date-fns';
import { Widget } from './widget';

export function UsersWidget() {
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const {
    data: { totalUsersCount, recentUsersCount },
  } = useUserCount({
    since: sevenDaysAgo,
  });

  return (
    <Widget
      label="Users"
      value={totalUsersCount.toLocaleString()}
      subtext={`${recentUsersCount} in last 7 days`}
    />
  );
}
