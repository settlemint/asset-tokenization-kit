import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { Burn } from '@/lib/mutations/stablecoin/burn';
import { formatNumber } from '@/lib/utils/number';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

interface AmountProps {
  balance: number;
}

export function Amount({ balance }: AmountProps) {
  const { control } = useFormContext<Burn>();
  const t = useTranslations('admin.stablecoins.burn-form.amount');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label={t('amount-label')}
          type="number"
          min={1}
          max={balance}
          description={t('available-balance', {
            balance: formatNumber(balance),
          })}
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ['amount'] as const;
