import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateTokenizedDepositInput } from '@/lib/mutations/tokenized-deposit/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Configuration() {
  const { control } = useFormContext<CreateTokenizedDepositInput>();
  const t = useTranslations('private.assets.create');

  return (
    <FormStep
      title={t('configuration.tokenizeddeposits.title')}
      description={t('configuration.tokenizeddeposits.description')}
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          control={control}
          type="number"
          name="collateralLivenessSeconds"
          label={t('parameters.common.collateral-proof-validity-label')}
          postfix={t('parameters.common.seconds-unit-label')}
          required
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = ['collateralLivenessSeconds'] as const;
