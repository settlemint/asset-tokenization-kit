import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const t = useTranslations('private.assets.details.forms.mature.summary');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        icon={<Clock className="size-3 text-primary-foreground" />}
        title={t('mature-title')}
        description={t('mature-description')}
      >
        <FormSummaryDetailItem
          label={t('asset-label')}
          value={<EvmAddress address={address} />}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
