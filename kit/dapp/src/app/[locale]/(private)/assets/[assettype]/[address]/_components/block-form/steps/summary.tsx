import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { BlockUserInput } from '@/lib/mutations/block-user/block-user-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

export function Summary() {
  const t = useTranslations('private.assets.details.forms.block');
  const { getValues } = useFormContext<BlockUserInput>();
  const { account, address } = getValues();

  return (
    <FormStep title={t('summary.title')} description={t('summary.description')}>
      <FormSummaryDetailItem
        label={t('parameters.asset-label')}
        value={<EvmAddress address={address} />}
      />
      <FormSummaryDetailItem
        label={t('parameters.account-label')}
        value={<EvmAddress address={account} />}
      />
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
