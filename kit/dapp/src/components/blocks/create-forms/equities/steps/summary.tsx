import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { CreateEquityInput } from '@/lib/mutations/equity/create/create-schema';
import { getPredictedAddress } from '@/lib/queries/equity-factory/predict-address';
import { DollarSign, Settings } from 'lucide-react';
import { type MessageKeys, useTranslations } from 'next-intl';
import { type UseFormReturn, useFormContext, useWatch } from 'react-hook-form';

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
            values.equityCategory
              ? t(
                  `category-${values.equityCategory.toLowerCase().replace(/_/g, '-')}` as MessageKeys<
                    'admin.equities.create-form.summary',
                    'equity-category-label'
                  >
                )
              : '-'
          }
        />
        <FormSummaryDetailItem
          label={t('equity-class-label')}
          value={
            values.equityClass
              ? t(
                  `class-${values.equityClass.toLowerCase().replace(/_/g, '-')}` as MessageKeys<
                    'admin.equities.create-form.summary',
                    'equity-class-label'
                  >
                )
              : '-'
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
