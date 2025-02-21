'use client';

import { AddContactButton } from '@/app/(private)/portfolio/my-contacts/(table)/_components/add-contact-form/add-contact-button';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getMyAssets } from '../../../../_components/data';

interface MyAssetsHeaderClientProps {
  queryKey: QueryKey;
  wallet: Address;
}

export function MyContactsHeaderClient({ queryKey, wallet }: MyAssetsHeaderClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: () => getMyAssets({ active: true, wallet: wallet }),
    refetchInterval: defaultRefetchInterval,
  });

  return (
    <div className="-mt-14 relative z-10 mb-14 flex items-center justify-end">
      <AddContactButton assets={data.balances} />
    </div>
  );
}
