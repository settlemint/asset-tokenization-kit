import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatNumber } from '@/lib/utils/number';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { type Address, getAddress } from 'viem';
import {
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from './asset-balance-fragment';

/**
 * GraphQL query to fetch a specific asset balance
 */
const AssetBalanceDetail = theGraphGraphqlStarterkits(
  `
  query Balance($address: String!, $account: String!) {
    assetBalances(where: {asset: $address, account: $account}) {
      ...AssetBalanceFragment
    }
  }
`,
  [AssetBalanceFragment]
);

/**
 * Props interface for asset balance detail components
 */
export interface AssetBalanceDetailProps {
  /** Ethereum address of the asset contract */
  address: Address;
  /** Optional account address to check balance for */
  account?: Address;
}

/**
 * Cached function to fetch raw asset balance data
 */
const fetchAssetBalanceData = unstable_cache(
  async (address: Address, account: Address) => {
    const result = await theGraphClientStarterkits.request(AssetBalanceDetail, {
      address,
      account,
    });

    return result;
  },
  ['asset', 'balance'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

/**
 * Fetches and processes asset balance data for a specific address and account
 *
 * @param params - Object containing the asset address and account
 * @returns Asset balance data or undefined if not found
 */
export async function getAssetBalanceDetail({
  address,
  account,
}: AssetBalanceDetailProps) {
  if (!account) {
    return undefined;
  }

  const normalizedAddress = getAddress(address);
  const normalizedAccount = getAddress(account);

  const result = await fetchAssetBalanceData(
    normalizedAddress,
    normalizedAccount
  );

  // Return undefined if no balance found
  if (result.assetBalances.length === 0) {
    return undefined;
  }

  // Parse and validate the balance data
  const validatedBalance = safeParseWithLogging(
    AssetBalanceFragmentSchema,
    result.assetBalances[0],
    'asset balance'
  );

  // Format BigDecimal values
  return {
    ...validatedBalance,
    value: formatNumber(validatedBalance.value),
    frozen: formatNumber(validatedBalance.frozen),
  };
}
