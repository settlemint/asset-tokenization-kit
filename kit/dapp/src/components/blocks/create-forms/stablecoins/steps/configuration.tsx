import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateStablecoinInput } from '@/lib/mutations/stablecoin/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateStablecoinInput>();
  const t = useTranslations('private.assets.create');

  return (
    <FormStep
      title={t('configuration.stablecoins.title')}
      description={t('configuration.stablecoins.description')}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          type="number"
          name="collateralLivenessSeconds"
          label={t('parameters.stablecoins.collateral-proof-validity-label')}
          postfix={t('parameters.stablecoins.seconds-unit-label')}
          required
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = ['collateralLivenessSeconds'] as const;
