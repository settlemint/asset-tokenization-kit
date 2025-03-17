import { FormStep } from '@/components/blocks/form/form-step';
import { FormAssets } from '@/components/blocks/form/inputs/form-assets';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateBondInput } from '@/lib/mutations/bond/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateBondInput>();
  const t = useTranslations('private.assets.create');

  return (
    <FormStep
      title={t('configuration.bonds.title')}
      description={t('configuration.bonds.description')}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          name="cap"
          type="number"
          label={t('parameters.bonds.cap-label')}
          description={t('parameters.bonds.cap-description')}
          required
        />
        <FormInput
          control={control}
          name="faceValue"
          type="number"
          label={t('parameters.bonds.face-value-label')}
          description={t('parameters.bonds.face-value-description')}
          required
        />
        <FormInput
          control={control}
          type="date"
          name="maturityDate"
          label={t('parameters.bonds.maturity-date-label')}
          required
        />
        <FormAssets
          control={control}
          name="underlyingAsset"
          label={t('parameters.bonds.underlying-asset-label')}
          description={t('parameters.bonds.underlying-asset-description')}
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
