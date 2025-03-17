'use client';

import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { WithdrawInput } from '@/lib/mutations/withdraw/withdraw-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Amount() {
  const { control } = useFormContext<WithdrawInput>();
  const t = useTranslations('private.assets.details.forms.withdraw.amount');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormInput
        control={control}
        name="amount"
        type="number"
        min={0}
        step="any"
        label={t('amount.label')}
        description={t('amount.description')}
      />
    </FormStep>
  );
}

Amount.validatedFields = ['amount'] as const;
