import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { FormStep } from '@/components/blocks/form/form-step';
import { FormSummaryDetailCard } from '@/components/blocks/form/summary/card';
import { FormSummaryDetailItem } from '@/components/blocks/form/summary/item';
import type { MintInput as BondMintInput } from '@/lib/mutations/bond/mint/mint-schema';
import type { MintInput as CryptocurrencyMintInput } from '@/lib/mutations/cryptocurrency/mint/mint-schema';
import type { MintInput as EquityMintInput } from '@/lib/mutations/equity/mint/mint-schema';
import type { MintInput as FundMintInput } from '@/lib/mutations/fund/mint/mint-schema';
import type { MintInput as StablecoinMintInput } from '@/lib/mutations/stablecoin/mint/mint-schema';
import type { MintInput as TokenizedDepositMintInput } from '@/lib/mutations/tokenized-deposit/mint/mint-schema';
import { formatNumber } from '@/lib/utils/number';
import { DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Address } from 'viem';

interface SummaryProps {
  address: Address;
}

export function Summary({ address }: SummaryProps) {
  const { control } = useFormContext<
    | BondMintInput
    | CryptocurrencyMintInput
    | EquityMintInput
    | FundMintInput
    | StablecoinMintInput
    | TokenizedDepositMintInput
    | StablecoinMintInput
  >();
  const t = useTranslations('private.assets.details.forms.mint.summary');
  const values = useWatch({
    control: control,
  });

  return (
    <FormStep title={t('title')} description={t('description')}>
      <FormSummaryDetailCard
        icon={<DollarSign className="size-3 text-primary-foreground" />}
        title={t('mint-title')}
        description={t('mint-description')}
      >
        <FormSummaryDetailItem
          label={t('asset-label')}
          value={<EvmAddress address={address} />}
        />
        <FormSummaryDetailItem
          label={t('amount-label')}
          value={formatNumber(values.amount ?? 0)}
        />
      </FormSummaryDetailCard>
    </FormStep>
  );
}

Summary.validatedFields = [] as const;
