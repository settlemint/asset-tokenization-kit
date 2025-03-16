import { AssetRolePill } from '@/components/blocks/asset-role-pill/asset-role-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { Role } from '@/lib/config/roles';
import type { UpdateRolesInput } from '@/lib/mutations/asset/access-control/update-role/update-role-schema';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';

export function Summary({
  userAddress,
  currentRoles,
}: {
  userAddress: Address;
  currentRoles: Role[];
}) {
  const t = useTranslations(
    'private.assets.details.permissions.edit-form.summary'
  );
  const { getValues } = useFormContext<UpdateRolesInput>();
  const values = getValues();

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        title={t('update-title')}
        description={t('operation-description')}
        icon={<Lock className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t('user-label')}
          value={<EvmAddress address={userAddress} />}
        />
        <FormSummaryDetailItem
          label={t('current-roles-label')}
          value={<AssetRolePill roles={currentRoles} />}
        />
        <FormSummaryDetailItem
          label={t('new-roles-label')}
          value={<AssetRolePill roles={values.roles} />}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
