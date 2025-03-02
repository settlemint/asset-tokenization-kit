import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import { type Role, getRoleDisplayName } from '@/lib/config/roles';
import type { GrantRoleInput } from '@/lib/mutations/bond/grant-role/grant-role-schema';
import { DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<GrantRoleInput>();
  const t = useTranslations('admin.bonds.grant-role-form.summary');
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        title={t('grant-title')}
        description={t('grant-description')}
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t('asset-label')}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t('admin-address-label')}
          value={<EvmAddress address={values.userAddress as Address} />}
        />
        <FormSummaryDetailItem
          label={t('roles-label')}
          value={
            <div className="flex flex-wrap gap-1">
              {Object.entries(values.roles ?? {})
                .filter(([, isEnabled]) => isEnabled)
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
