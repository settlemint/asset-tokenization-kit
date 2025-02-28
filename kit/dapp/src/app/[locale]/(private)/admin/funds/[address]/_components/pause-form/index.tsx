import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import type { Address } from 'viem';
import { PauseForm } from './form';

interface PauseFormWrapperProps {
  address: Address;
}

export async function PauseFormWrapper({ address }: PauseFormWrapperProps) {
  const stableCoin = await getStableCoinDetail({ address });
  return <PauseForm address={address} isPaused={stableCoin.paused} />;
}
