'use client';

import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { TransferCryptoCurrencyInput } from '@/lib/mutations/cryptocurrency/transfer/transfer-schema';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

interface AmountProps {
  balance: number;
}

export function Amount({ balance }: AmountProps) {
  const { control } = useFormContext<TransferCryptoCurrencyInput>();
  const t = useTranslations('portfolio.my-assets.cryptocurrency');

  return (
    <FormStep
      title={t('transfer-form.amount.title')}
      description={t('transfer-form.amount.description')}
    >
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="value"
          label={t('transfer-form.amount.amount-label')}
          type="number"
          min={1}
          defaultValue={1}
          max={balance}
          description={`${t('transfer-form.amount.balance-description')} ${formatNumber(balance)}`}
          required
        />
      </div>
    </FormStep>
  );
}
