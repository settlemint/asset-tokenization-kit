'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { pause as BondPause } from '@/lib/mutations/bond/pause/pause-action';
import { PauseSchema as BondPauseSchema } from '@/lib/mutations/bond/pause/pause-schema';
import { unpause as BondUnpause } from '@/lib/mutations/bond/unpause/unpause-action';
import { UnPauseSchema as BondUnPauseSchema } from '@/lib/mutations/bond/unpause/unpause-schema';
import { pause as EquityPause } from '@/lib/mutations/equity/pause/pause-action';
import { PauseSchema as EquityPauseSchema } from '@/lib/mutations/equity/pause/pause-schema';
import { unpause as EquityUnpause } from '@/lib/mutations/equity/unpause/unpause-action';
import { UnPauseSchema as EquityUnPauseSchema } from '@/lib/mutations/equity/unpause/unpause-schema';
import { pause as FundPause } from '@/lib/mutations/fund/pause/pause-action';
import { PauseSchema as FundPauseSchema } from '@/lib/mutations/fund/pause/pause-schema';
import { unpause as FundUnpause } from '@/lib/mutations/fund/unpause/unpause-action';
import { UnPauseSchema as FundUnPauseSchema } from '@/lib/mutations/fund/unpause/unpause-schema';
import { pause as StablecoinPause } from '@/lib/mutations/stablecoin/pause/pause-action';
import { PauseSchema as StablecoinPauseSchema } from '@/lib/mutations/stablecoin/pause/pause-schema';
import { unpause as StablecoinUnpause } from '@/lib/mutations/stablecoin/unpause/unpause-action';
import { UnPauseSchema as StablecoinUnPauseSchema } from '@/lib/mutations/stablecoin/unpause/unpause-schema';
import { pause as TokenizedDepositPause } from '@/lib/mutations/tokenized-deposit/pause/pause-action';
import { PauseSchema as TokenizedDepositPauseSchema } from '@/lib/mutations/tokenized-deposit/pause/pause-schema';
import { unpause as TokenizedDepositUnpause } from '@/lib/mutations/tokenized-deposit/unpause/unpause-action';
import { UnPauseSchema as TokenizedDepositUnPauseSchema } from '@/lib/mutations/tokenized-deposit/unpause/unpause-schema';
import type { AssetType } from '@/lib/utils/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { Summary } from './steps/summary';

interface PauseFormProps {
  address: Address;
  assettype: AssetType;
  isPaused: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PauseForm({
  address,
  assettype,
  isPaused,
  open,
  onOpenChange,
}: PauseFormProps) {
  const t = useTranslations('private.assets.details.forms.pause');

  if (isPaused) {
    return (
      <FormSheet
        open={open}
        onOpenChange={onOpenChange}
        title={t('unpause.title')}
        description={t('unpause.description')}
      >
        <Form
          action={
            assettype === 'bond'
              ? BondUnpause
              : assettype === 'equity'
                ? EquityUnpause
                : assettype === 'fund'
                  ? FundUnpause
                  : assettype === 'stablecoin'
                    ? StablecoinUnpause
                    : TokenizedDepositUnpause
          }
          resolver={
            assettype === 'bond'
              ? zodResolver(BondUnPauseSchema)
              : assettype === 'equity'
                ? zodResolver(EquityUnPauseSchema)
                : assettype === 'fund'
                  ? zodResolver(FundUnPauseSchema)
                  : assettype === 'stablecoin'
                    ? zodResolver(StablecoinUnPauseSchema)
                    : zodResolver(TokenizedDepositUnPauseSchema)
          }
          onOpenChange={onOpenChange}
          buttonLabels={{
            label: t('unpause.button-label'),
          }}
          defaultValues={{
            address,
          }}
        >
          <Summary address={address} isCurrentlyPaused={isPaused} />
        </Form>
      </FormSheet>
    );
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('pause.title')}
      description={t('pause.description')}
    >
      <Form
        action={
          assettype === 'bond'
            ? BondPause
            : assettype === 'equity'
              ? EquityPause
              : assettype === 'fund'
                ? FundPause
                : assettype === 'stablecoin'
                  ? StablecoinPause
                  : TokenizedDepositPause
        }
        resolver={
          assettype === 'bond'
            ? zodResolver(BondPauseSchema)
            : assettype === 'equity'
              ? zodResolver(EquityPauseSchema)
              : assettype === 'fund'
                ? zodResolver(FundPauseSchema)
                : assettype === 'stablecoin'
                  ? zodResolver(StablecoinPauseSchema)
                  : zodResolver(TokenizedDepositPauseSchema)
        }
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t('pause.button-label'),
        }}
        defaultValues={{
          address,
        }}
      >
        <Summary address={address} isCurrentlyPaused={isPaused} />
      </Form>
    </FormSheet>
  );
}
