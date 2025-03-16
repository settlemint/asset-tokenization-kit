import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { CreateFundInput } from '@/lib/mutations/fund/create/create-schema';
import { getPredictedAddress } from '@/lib/queries/fund-factory/predict-address';
import type { fundCategories, fundClasses } from '@/lib/utils/zod';
import { DollarSign, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type UseFormReturn, useFormContext, useWatch } from 'react-hook-form';
import { FundCategoriesSummary } from './_components/fund-categories-summary';
import { FundClassesSummary } from './_components/fund-classes-summary';

export function Summary() {
  const { control } = useFormContext<CreateFundInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations('private.assets.create.funds.summary');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        title={t('asset-basics-title')}
        description={t('asset-basics-description')}
        icon={<DollarSign className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t('name-label')}
          value={values.assetName}
        />
        <FormSummaryDetailItem
          label={t('symbol-label')}
          value={values.symbol}
        />
        <FormSummaryDetailItem
          label={t('decimals-label')}
          value={values.decimals}
        />
        <FormSummaryDetailItem
          label={t('isin-label')}
          value={values.isin === '' ? '-' : values.isin}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t('configuration-title')}
        description={t('configuration-description')}
        icon={<Settings className="size-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t('fund-category-label')}
          value={
            values.fundCategory ? (
              <FundCategoriesSummary
                value={values.fundCategory as (typeof fundCategories)[number]}
              />
            ) : (
              '-'
            )
          }
        />
        <FormSummaryDetailItem
          label={t('fund-class-label')}
          value={
            values.fundClass ? (
              <FundClassesSummary
                value={values.fundClass as (typeof fundClasses)[number]}
              />
            ) : (
              '-'
            )
          }
        />
        <FormSummaryDetailItem
          label={t('management-fee-label')}
          value={
            values.managementFeeBps
              ? `${values.managementFeeBps / 100}% (${values.managementFeeBps} ${t('basis-points')})`
              : '-'
          }
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = ['predictedAddress'] as const;
Summary.beforeValidate = [
  async ({ setValue, getValues }: UseFormReturn<CreateFundInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue('predictedAddress', predictedAddress);
  },
];
