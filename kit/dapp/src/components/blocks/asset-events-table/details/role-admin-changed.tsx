import type { RoleAdminChangedEvent } from '@/lib/queries/asset-events/asset-events-fragments';
import { roles } from '@/lib/roles';
import { useTranslations } from 'next-intl';
import { DetailsCard } from '../details-card';

interface RoleAdminChangedDetailsProps {
  details: RoleAdminChangedEvent;
}

export function RoleAdminChangedDetails({
  details,
}: RoleAdminChangedDetailsProps) {
  const t = useTranslations('components.asset-events-table.details');

  const detailItems = [
    {
      key: 'role',
      label: t('role'),
      value: roles[details.role],
    },
    {
      key: 'previous-admin-role',
      label: t('previous-admin-role'),
      value: details.previousAdminRole,
    },
    {
      key: 'new-admin-role',
      label: t('new-admin-role'),
      value: details.newAdminRole,
    },
  ];

  return <DetailsCard details={detailItems} />;
}
