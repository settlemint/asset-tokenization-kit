import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateStablecoinInput } from '@/lib/mutations/stablecoin/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Basics() {
  const { control } = useFormContext<CreateStablecoinInput>();
  const t = useTranslations('private.assets.create.stablecoins.basics');

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
        <div className="grid grid-cols-2 gap-6">
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
            name="isin"
            label={t('isin-label')}
            placeholder={t('isin-placeholder')}
          />
        </div>
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

Basics.validatedFields = ['assetName', 'symbol', 'decimals', 'isin'] as const;
