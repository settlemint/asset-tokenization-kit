import { assetConfig } from '@/lib/config/assets';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { useSuspenseQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { Address } from 'viem';

const BalanceFragment = theGraphGraphqlStarterkits(`
  fragment BalanceFragment on AssetBalance {
    value
    asset {
      id
      name
      symbol
      type
      decimals
      ... on StableCoin {
        paused
      }
      ... on Bond {
        paused
      }
      ... on Fund {
        paused
      }
      ... on Equity {
        paused
      }
    }
  }
`);

const MyAssets = theGraphGraphqlStarterkits(
  `
  query MyAssets($accountId: ID!, $first: Int, $skip: Int) {
    account(id: $accountId) {
      balances(first: $first, skip: $skip) {
        ...BalanceFragment
      }
    }
  }
`,
  [BalanceFragment]
);

export type BalanceFragment = FragmentOf<typeof BalanceFragment>;

type AssetType = keyof typeof assetConfig;

type PausableAsset = BalanceFragment['asset'] & {
  paused: boolean;
};

function isPausableAsset(asset: {
  __typename?: 'StableCoin' | 'Bond' | 'Fund' | 'Equity' | 'CryptoCurrency';
}): asset is PausableAsset {
  if (!asset.__typename) {
    return false;
  }
  const pausableAssetTypeNames = Object.values(assetConfig)
    .filter((asset) => asset.features.ERC20Pausable)
    .map((asset) => asset.theGraphTypename);
  return pausableAssetTypeNames.includes(asset.__typename);
}

export type MyAsset = Awaited<ReturnType<typeof getMyAssets>>['balances'][number];

interface MyAssetsParams {
  active: boolean;
  wallet: Address;
}

export function useMyAssets(params: MyAssetsParams) {
  return useSuspenseQuery({
    queryKey: ['my-assets', params],
    queryFn: () => getMyAssets(params)
  });
}

export async function getMyAssets({ active, wallet }: MyAssetsParams) {
  let result = await fetchAllTheGraphPages(async (first, skip) => {
    const pageResult = await theGraphClientStarterkits.request(MyAssets, { accountId: wallet, first, skip });
    return pageResult.account?.balances ?? [];
  });

  if (!result.length) {
    return {
      balances: [],
      distribution: [],
      total: '0',
    };
  }

  if (active) {
    result = result.filter((balance) => {
      const asset = balance.asset;
      if (!isPausableAsset(asset)) {
        return true;
      }
      return !asset.paused;
    });
  }

  // Group and sum balances by asset type
  const assetTypeBalances = result.reduce<Record<AssetType, BigNumber>>(
    (acc, balance) => {
      const assetType = balance.asset.type as AssetType;
      if (!acc[assetType]) {
        acc[assetType] = BigNumber(0);
      }
      acc[assetType] = acc[assetType].plus(BigNumber(balance.value));
      return acc;
    },
    {} as Record<AssetType, BigNumber>
  );

  // Calculate total across all types
  const total = Object.values(assetTypeBalances).reduce((acc, value) => acc.plus(value), BigNumber(0));

  // Calculate distribution percentages by type
  const distribution = Object.entries(assetTypeBalances).map(([type, value]) => ({
    asset: { type: type as AssetType },
    value: value.toString(),
    percentage: total.gt(0) ? Number.parseFloat(value.div(total).multipliedBy(100).toFixed(2)) : 0,
  }));

  return {
    balances: result,
    distribution,
    total: total.toString(),
  };
}
