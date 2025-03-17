'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { transfer as BondTransfer } from '@/lib/mutations/bond/transfer/transfer-action';
import { TransferBondSchema } from '@/lib/mutations/bond/transfer/transfer-schema';
import { transfer as CryptoCurrencyTransfer } from '@/lib/mutations/cryptocurrency/transfer/transfer-action';
import { TransferCryptoCurrencySchema } from '@/lib/mutations/cryptocurrency/transfer/transfer-schema';
import { transfer as EquitiesTransfer } from '@/lib/mutations/equity/transfer/transfer-action';
import { TransferEquitySchema } from '@/lib/mutations/equity/transfer/transfer-schema';
import { transfer as FundsTransfer } from '@/lib/mutations/fund/transfer/transfer-action';
import { TransferFundSchema } from '@/lib/mutations/fund/transfer/transfer-schema';
import { transfer as StablecoinsTransfer } from '@/lib/mutations/stablecoin/transfer/transfer-action';
import { TransferStableCoinSchema } from '@/lib/mutations/stablecoin/transfer/transfer-schema';
import { transfer as TokenizedDepositTransfer } from '@/lib/mutations/tokenized-deposit/transfer/transfer-action';
import { TransferTokenizedDepositSchema } from '@/lib/mutations/tokenized-deposit/transfer/transfer-schema';
import type { AssetType } from '@/lib/utils/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';

interface TransferFormProps {
  address: Address;
  assettype: AssetType;
  balance: number;
  decimals: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransferForm({
  address,
  assettype,
  balance,
  decimals,
  asButton = false,
  open,
  onOpenChange,
}: TransferFormProps) {
  const t = useTranslations('portfolio.my-assets.bond');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={
        isExternallyControlled ? undefined : t('transfer-form.trigger-label')
      }
      title={t('transfer-form.title')}
      description={t('transfer-form.description')}
      asButton={asButton}
    >
      <Form
        action={
          assettype === 'bond'
            ? BondTransfer
            : assettype === 'cryptocurrency'
              ? CryptoCurrencyTransfer
              : assettype === 'equity'
                ? EquitiesTransfer
                : assettype === 'fund'
                  ? FundsTransfer
                  : assettype === 'stablecoin'
                    ? StablecoinsTransfer
                    : TokenizedDepositTransfer
        }
        resolver={
          assettype === 'bond'
            ? zodResolver(TransferBondSchema)
            : assettype === 'cryptocurrency'
              ? zodResolver(TransferCryptoCurrencySchema)
              : assettype === 'equity'
                ? zodResolver(TransferEquitySchema)
                : assettype === 'fund'
                  ? zodResolver(TransferFundSchema)
                  : assettype === 'stablecoin'
                    ? zodResolver(TransferStableCoinSchema)
                    : zodResolver(TransferTokenizedDepositSchema)
        }
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t('transfer-form.button-label'),
        }}
        defaultValues={{
          address,
          decimals,
        }}
      >
        <Amount balance={balance} />
        <Recipients />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
