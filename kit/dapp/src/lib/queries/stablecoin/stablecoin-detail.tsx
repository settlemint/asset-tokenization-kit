import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatNumber } from '@/lib/utils/number';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { addSeconds } from 'date-fns';
import BigDecimal from 'js-big-decimal';
import { unstable_cache } from 'next/cache';
import { getAddress, type Address } from 'viem';
import {
  OffchainStableCoinFragment,
  OffchainStableCoinFragmentSchema,
  StableCoinFragment,
  StableCoinFragmentSchema,
} from './stablecoin-fragment';

/**
 * GraphQL query to fetch on-chain stablecoin details from The Graph
 */
const StableCoinDetail = theGraphGraphqlStarterkits(
  `
  query StableCoinDetail($id: ID!) {
    stableCoin(id: $id) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

/**
 * GraphQL query to fetch off-chain stablecoin details from Hasura
 */
const OffchainStableCoinDetail = hasuraGraphql(
  `
  query OffchainStableCoinDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainStableCoinFragment
    }
  }
`,
  [OffchainStableCoinFragment]
);

/**
 * Props interface for stablecoin detail components
 */
export interface StableCoinDetailProps {
  /** Ethereum address of the stablecoin contract */
  address: Address;
}

/**
 * Cached function to fetch stablecoin data from both sources
 */
const fetchStableCoinData = unstable_cache(
  async (address: Address, normalizedAddress: Address) => {
    console.log('fetchStableCoinData', address, normalizedAddress);
    return Promise.all([
      theGraphClientStarterkits.request(StableCoinDetail, { id: address }),
      hasuraClient.request(OffchainStableCoinDetail, { id: normalizedAddress }),
    ]);
  },
  ['asset', 'stablecoin'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

/**
 * Fetches and combines on-chain and off-chain stablecoin data
 *
 * @param params - Object containing the stablecoin address
 * @returns Combined stablecoin data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export async function getStableCoinDetail({ address }: StableCoinDetailProps) {
  const normalizedAddress = getAddress(address);

  const [data, dbStableCoin] = await fetchStableCoinData(
    address,
    normalizedAddress
  );

  const stableCoin = safeParseWithLogging(
    StableCoinFragmentSchema,
    data.stableCoin,
    'stablecoin'
  );
  const offchainStableCoin = dbStableCoin.asset[0]
    ? safeParseWithLogging(
        OffchainStableCoinFragmentSchema,
        dbStableCoin.asset[0],
        'offchain stablecoin'
      )
    : undefined;

  const topHoldersSum = stableCoin.holders.reduce(
    (sum, holder) => sum + holder.valueExact,
    0n
  );
  const concentration =
    stableCoin.totalSupplyExact === 0n
      ? 0
      : Number((topHoldersSum * 100n) / stableCoin.totalSupplyExact);

  const collateralCommittedRatio =
    stableCoin.collateral.compareTo(new BigDecimal(0)) === 0
      ? new BigDecimal(100)
      : stableCoin.totalSupply
          .divide(stableCoin.collateral)
          .multiply(new BigDecimal(100));

  const collateralProofValidity = addSeconds(
    stableCoin.lastCollateralUpdate,
    stableCoin.liveness
  );

  return {
    ...stableCoin,
    ...{
      private: false,
      ...offchainStableCoin,
    },
    concentration,
    collateralCommittedRatio: Number(collateralCommittedRatio.getValue()),
    collateralProofValidity,
    collateral: formatNumber(stableCoin.collateral),
    totalSupply: formatNumber(stableCoin.totalSupply),
  };
}
