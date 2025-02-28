import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import { type Role, getRoleDisplayName } from '@/lib/config/roles';
import type { UpdateRolesInput } from '@/lib/mutations/bond/update-roles/update-roles-schema';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

export function Summary({
  userAddress,
  currentRoles: roles,
}: {
  userAddress: Address;
  currentRoles: Role[];
}) {
  const { control } = useFormContext<UpdateRolesInput>();
  const t = useTranslations('admin.bonds.permissions.edit-form.summary');
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        title={t('update-title')}
        description={t('operation-description')}
        icon={<Lock className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t('user-label')}
          value={<EvmAddress address={userAddress} />}
        />
        <FormSummaryDetailItem
          label={t('current-roles-label')}
          value={
            <div className="flex flex-wrap gap-1">
              {roles.map((role: Role) => (
                <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
                  {getRoleDisplayName(role)}
                </span>
              ))}
            </div>
          }
        />
        <FormSummaryDetailItem
          label={t('new-roles-label')}
          value={
            <div className="flex flex-wrap gap-1">
              {Object.entries(values.roles ?? {})
                .filter(([_, isEnabled]) => isEnabled)
                .map(([role]) => (
                  <span
                    key={role}
                    className="rounded bg-muted px-2 py-1 text-xs"
                  >
                    {getRoleDisplayName(role as Role)}
                  </span>
                ))}
            </div>
          }
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
