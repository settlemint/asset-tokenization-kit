import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { TransferCryptoCurrencyInput } from '@/lib/mutations/cryptocurrency/transfer/transfer-schema';
import { formatNumber } from '@/lib/utils/number';
import { DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<TransferCryptoCurrencyInput>();
  const t = useTranslations(
    'portfolio.my-assets.cryptocurrency.transfer-form.summary'
  );
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        icon={<DollarSign className="size-3 text-primary-foreground" />}
        title={t('transfer-title')}
        description={t('transfer-description')}
      >
        <FormSummaryDetailItem
          label={t('asset-label')}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t('value-label')}
          value={formatNumber(values.value ?? 0)}
        />
        <FormSummaryDetailItem
          label={t('recipient-label')}
          value={values.to ? <EvmAddress address={values.to} /> : '-'}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
