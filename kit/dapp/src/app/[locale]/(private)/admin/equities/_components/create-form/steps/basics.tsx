import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import { FormSwitch } from '@/components/blocks/form/inputs/form-switch';
import type { CreateEquityInput } from '@/lib/mutations/equity/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Basics() {
  const { control } = useFormContext<CreateEquityInput>();
  const t = useTranslations('admin.equities.create-form.basics');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="assetName"
          label={t('name-label')}
          placeholder={t('name-placeholder')}
        />
        <FormInput
          control={control}
          name="symbol"
          label={t('symbol-label')}
          placeholder={t('symbol-placeholder')}
          textOnly
        />
        <FormInput
          control={control}
          type="number"
          name="decimals"
          label={t('decimals-label')}
          defaultValue={18}
        />
        <FormInput
          control={control}
          name="isin"
          label={t('isin-label')}
          placeholder={t('isin-placeholder')}
        />
      </div>
      <FormSwitch
        control={control}
        name="privateAsset"
        label={t('private-token-label')}
        description={t('private-token-description')}
        defaultValue={true}
      />
    </FormStep>
  );
}

Basics.validatedFields = [
  'assetName',
  'symbol',
  'decimals',
  'privateAsset',
  'isin',
] as const;
