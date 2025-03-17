import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateCryptoCurrencyInput } from '@/lib/mutations/cryptocurrency/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations('private.assets.create');

  return (
    <FormStep
      title={t('configuration.cryptocurrencies.title')}
      description={t('configuration.cryptocurrencies.description')}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="initialSupply"
          type="number"
          label={t('parameters.cryptocurrencies.initial-supply-label')}
          description={t(
            'parameters.cryptocurrencies.initial-supply-description'
          )}
          required
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = ['initialSupply'] as const;
