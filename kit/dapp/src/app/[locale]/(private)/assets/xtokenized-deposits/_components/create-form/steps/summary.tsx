import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { CreateTokenizedDepositInput } from '@/lib/mutations/tokenized-deposit/create/create-schema';
import { getPredictedAddress } from '@/lib/queries/tokenizeddeposit-factory/predict-address';
import { DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type UseFormReturn, useFormContext, useWatch } from 'react-hook-form';

export function Summary() {
  const { control } = useFormContext<CreateTokenizedDepositInput>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations('admin.stablecoins.create-form.summary');

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
    </FormStep>
  );
}

Summary.validatedFields = ['predictedAddress'] as const;
Summary.beforeValidate = [
  async ({
    setValue,
    getValues,
  }: UseFormReturn<CreateTokenizedDepositInput>) => {
    const values = getValues();
    const predictedAddress = await getPredictedAddress(values);

    setValue('predictedAddress', predictedAddress);
  },
];
