import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import type { PauseInput } from '@/lib/mutations/fund/pause/pause-schema';
import type { UnPauseInput } from '@/lib/mutations/fund/unpause/unpause-schema';
import { DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
  isCurrentlyPaused: boolean;
}

export function Summary({ address, isCurrentlyPaused }: SummaryProps) {
  const { control } = useFormContext<PauseInput | UnPauseInput>();
  const t = useTranslations('admin.funds.pause-form.summary');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        title={t('pause-title')}
        description={t('pause-description')}
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t('asset-label')}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t('current-state-label')}
          value={isCurrentlyPaused ? t('state-paused') : t('state-active')}
        />
        <FormSummaryDetailItem
          label={t('target-state-label')}
          value={isCurrentlyPaused ? t('state-active') : t('state-paused')}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
