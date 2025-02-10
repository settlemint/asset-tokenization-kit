import { QueryWrapper } from '@/components/blocks/query-wrapper/query-wrapper';
import { getUserWidgetData } from './data';
import { UsersWidgetClient } from './users-client';

export function UsersWidget() {
  return <QueryWrapper queryKey={['users']} queryFn={getUserWidgetData} ClientComponent={UsersWidgetClient} />;
}
