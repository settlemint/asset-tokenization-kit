import { FormStep } from '@/components/blocks/form/form-step';
import { FormInput } from '@/components/blocks/form/inputs/form-input';
import type { CreateFundInput } from '@/lib/mutations/fund/create/create-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { FundCategoriesSelect } from './_components/fund-categories';
import { FundClassesSelect } from './_components/fund-classes';

export function Configuration() {
  const { control } = useFormContext<CreateFundInput>();
  const t = useTranslations('private.assets.create.funds.configuration');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="grid grid-cols-2 gap-6">
        <FundCategoriesSelect label={t('fund-category-label')} />
        <FundClassesSelect label={t('fund-class-label')} />
        <FormInput
          control={control}
          type="number"
          name="managementFeeBps"
          label={t('management-fee-label')}
          description={t('management-fee-description')}
          postfix={t('basis-points')}
          required
        />
      </div>
    </FormStep>
  );
}

Configuration.validatedFields = [
  'fundCategory',
  'fundClass',
  'managementFeeBps',
] as const;
