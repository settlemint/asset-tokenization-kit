import { FormStep } from '@/components/blocks/form/form-step';
import { FormOtp } from '@/components/blocks/form/inputs/form-otp';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import { FormSummarySecurityConfirmation } from '@/components/blocks/form/summary/security-confirmation';
import type { CreateStablecoin } from '@/lib/mutations/stablecoin/create';
import { DollarSign, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

export function Summary() {
  const { control } = useFormContext<CreateStablecoin>();
  const values = useWatch({
    control: control,
  });
  const t = useTranslations('admin.stablecoins.create.summary');

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        title={t('asset-basics-title')}
        description={t('asset-basics-description')}
        icon={<DollarSign className="h-3 w-3 text-primary-foreground" />}
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
        <FormSummaryDetailItem
          label={t('private-label')}
          value={values.privateAsset ? t('yes') : t('no')}
        />
      </FormSummaryDetailCard>

      <FormSummaryDetailCard
        title={t('configuration-title')}
        description={t('configuration-description')}
        icon={<Settings className="h-3 w-3 text-primary-foreground" />}
      >
        <FormSummaryDetailItem
          label={t('collateral-proof-validity-label')}
          value={`${values.collateralLivenessSeconds} ${t('seconds')}`}
        />
      </FormSummaryDetailCard>

      <FormSummarySecurityConfirmation>
        <FormOtp control={control} name="pincode" />
      </FormSummarySecurityConfirmation>
    </FormStep>
  );
}

Summary.validatedFields = ['pincode'] as const;
