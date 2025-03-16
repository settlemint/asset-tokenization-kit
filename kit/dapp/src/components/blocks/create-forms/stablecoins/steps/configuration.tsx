import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateStablecoinInput } from '@/lib/mutations/stablecoin/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateStablecoinInput>();
  const t = useTranslations('admin.stablecoins.create-form.configuration');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          type="number"
          name="collateralLivenessSeconds"
          label={t('collateral-proof-validity-label')}
          postfix="seconds"
          required
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = ['collateralLivenessSeconds'] as const;
