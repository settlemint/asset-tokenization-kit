import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { CreateEquityInput } from '@/lib/mutations/equity/create/create-schema';
import { getPredictedAddress } from '@/lib/queries/equity-factory/predict-address';
import type { equityCategories, equityClasses } from '@/lib/utils/zod';
import { DollarSign, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type UseFormReturn, useFormContext, useWatch } from 'react-hook-form';
import { EquityCategoriesSummary } from './_components/equity-categories-summary';
import { EquityClassesSummary } from './_components/equity-classes-summary';

export function Summary() {
  const { control } = useFormContext<CreateEquityInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations('private.assets.create.equities.summary');

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
          label={t('equity-category-label')}
          value={
            values.equityCategory ? (
              <EquityCategoriesSummary
                value={
                  values.equityCategory as (typeof equityCategories)[number]
                }
              />
            ) : (
              '-'
            )
          }
        />
        <FormSummaryDetailItem
          label={t('equity-class-label')}
          value={
            values.equityClass ? (
              <EquityClassesSummary
                value={values.equityClass as (typeof equityClasses)[number]}
              />
            ) : (
              '-'
            )
          }
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = ['predictedAddress'] as const;
Summary.beforeValidate = [
  async ({ setValue, getValues }: UseFormReturn<CreateEquityInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue('predictedAddress', predictedAddress);
  },
];
