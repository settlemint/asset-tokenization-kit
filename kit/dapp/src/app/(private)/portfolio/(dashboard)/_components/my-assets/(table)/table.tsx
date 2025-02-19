import { MyAssetsTable } from '@/components/blocks/my-assets/my-assets';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { queryKeys } from '@/lib/react-query';
import type { Address } from 'viem';
import { MyAssetsTableClient } from './table-client';

export async function MyAssets() {
  const user = await getAuthenticatedUser();
  const queryKey = queryKeys.user.balances(user.wallet as Address);
  return (
    <MyAssetsTable queryKey={queryKey} active={true}>
      <MyAssetsTableClient queryKey={queryKey} />
    </MyAssetsTable>
  );
}
