import { FormStep } from '@/components/blocks/form/form-step';
import { FormAssets } from '@/components/blocks/form/inputs/form-assets';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateBondInput } from '@/lib/mutations/bond/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateBondInput>();
  const t = useTranslations('private.assets.create.bonds.configuration');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="cap"
          type="number"
          label={t('cap-label')}
          description={t('cap-description')}
          required
        />
        <FormInput
          control={control}
          name="faceValue"
          type="number"
          label={t('face-value-label')}
          description={t('face-value-description')}
          required
        />
        <FormInput
          control={control}
          type="date"
          name="maturityDate"
          label={t('maturity-date-label')}
          required
        />
        <FormAssets
          control={control}
          name="underlyingAsset"
          label={t('underlying-asset-label')}
          description={t('underlying-asset-description')}
          required
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  'cap',
  'faceValue',
  'maturityDate',
  'underlyingAsset',
] as const;
