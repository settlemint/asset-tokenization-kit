import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { UpdateCollateral } from '@/lib/mutations/stablecoin/update-collateral';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Amount() {
  const { control } = useFormContext<UpdateCollateral>();
  const t = useTranslations('admin.stablecoins.update-collateral-form.amount');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="amount"
          label={t('amount-label')}
          type="number"
          min={1}
        />
      </div>
    </FormStep>
  );
}

Amount.validatedFields = ['amount'] as const;
