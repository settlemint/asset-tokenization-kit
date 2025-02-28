import { getBondDetail } from '@/lib/queries/bond/bond-detail';
import type { Address } from 'viem';
import { PauseForm } from './form';

interface PauseFormWrapperProps {
  address: Address;
}

export async function PauseFormWrapper({ address }: PauseFormWrapperProps) {
  const bond = await getBondDetail({ address });
  return <PauseForm address={address} isPaused={bond.paused} />;
}
