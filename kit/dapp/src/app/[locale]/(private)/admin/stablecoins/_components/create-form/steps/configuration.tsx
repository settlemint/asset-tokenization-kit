import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateStablecoin } from '@/lib/mutations/stablecoin/create';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateStablecoin>();
  const t = useTranslations('admin.stablecoins.create.configuration');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          type="number"
          name="collateralLivenessSeconds"
          label={t('collateral-proof-validity-label')}
          postfix="seconds"
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = ['collateralLivenessSeconds'] as const;
