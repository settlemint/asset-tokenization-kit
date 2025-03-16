import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateCryptoCurrencyInput } from '@/lib/mutations/cryptocurrency/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Basics() {
  const { control } = useFormContext<CreateCryptoCurrencyInput>();
  const t = useTranslations('admin.cryptocurrencies.create-form.basics');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-1 gap-6">
        <FormInput
          control={control}
          name="assetName"
          label={t('name-label')}
          placeholder={t('name-placeholder')}
          required
        />
        <FormInput
          control={control}
          name="symbol"
          label={t('symbol-label')}
          placeholder={t('symbol-placeholder')}
          textOnly
          required
        />
        <FormInput
          control={control}
          type="number"
          name="decimals"
          label={t('decimals-label')}
          defaultValue={18}
          required
        />
      </div>
    </FormStep>
  );
}

Basics.validatedFields = ['assetName', 'symbol', 'decimals'] as const;
