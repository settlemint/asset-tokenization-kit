'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { burn as BondBurn } from '@/lib/mutations/bond/burn/burn-action';
import { BurnSchema as BondBurnSchema } from '@/lib/mutations/bond/burn/burn-schema';
import { burn as EquityBurn } from '@/lib/mutations/equity/burn/burn-action';
import { BurnSchema as EquityBurnSchema } from '@/lib/mutations/equity/burn/burn-schema';
import { burn as FundBurn } from '@/lib/mutations/fund/burn/burn-action';
import { BurnSchema as FundBurnSchema } from '@/lib/mutations/fund/burn/burn-schema';
import { burn as StablecoinBurn } from '@/lib/mutations/stablecoin/burn/burn-action';
import { BurnSchema as StablecoinBurnSchema } from '@/lib/mutations/stablecoin/burn/burn-schema';
import { burn as TokenizedDepositBurn } from '@/lib/mutations/tokenized-deposit/burn/burn-action';
import { BurnSchema as TokenizedDepositBurnSchema } from '@/lib/mutations/tokenized-deposit/burn/burn-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import type { AssetType } from '../../../../types';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface BurnFormProps {
  address: Address;
  assettype: AssetType;
  balance: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BurnForm({
  address,
  assettype,
  balance,
  asButton = false,
  open,
  onOpenChange,
}: BurnFormProps) {
  const t = useTranslations('private.assets.details.forms.burn');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t('trigger-label')}
      title={t('title')}
      description={t('description')}
      asButton={asButton}
    >
      <Form
        action={
          assettype === 'bonds'
            ? BondBurn
            : assettype === 'equities'
              ? EquityBurn
              : assettype === 'funds'
                ? FundBurn
                : assettype === 'tokenizeddeposits'
                  ? TokenizedDepositBurn
                  : StablecoinBurn
        }
        resolver={
          assettype === 'bonds'
            ? zodResolver(BondBurnSchema)
            : assettype === 'equities'
              ? zodResolver(EquityBurnSchema)
              : assettype === 'funds'
                ? zodResolver(FundBurnSchema)
                : assettype === 'tokenizeddeposits'
                  ? zodResolver(TokenizedDepositBurnSchema)
                  : zodResolver(StablecoinBurnSchema)
        }
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
        }}
      >
        <Amount maxBurnAmount={balance} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
