'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { assetConfig } from '@/lib/config/assets';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import BigNumber from 'bignumber.js';

const BalanceFragment = theGraphGraphqlStarterkits(`
  fragment BalancesField on AssetBalance {
    value
    asset {
      id
      name
      symbol
      type
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
        ...BalancesField
      }
    }
  }
`,
  [BalanceFragment]
);

export type MyAsset = FragmentOf<typeof BalanceFragment>;

type AssetType = keyof typeof assetConfig;

interface Distribution {
  asset: {
    type: AssetType;
  };
  value: string;
  percentage: number;
}

interface MyAssetsResponse {
  balances: MyAsset[];
  distribution: Distribution[];
  total: string;
}

type PausableAsset = MyAsset['asset'] & {
  paused: boolean;
};

function isPausableAsset(asset: MyAsset['asset']): asset is PausableAsset {
  if (!asset.__typename) {
    return false;
  }
  const pausableAssetTypeNames = Object.values(assetConfig)
    .filter((asset) => asset.features.ERC20Pausable)
    .map((asset) => asset.theGraphTypename);
  return pausableAssetTypeNames.includes(asset.__typename);
}

export async function getMyAssets(active?: boolean): Promise<MyAssetsResponse> {
  const user = await getAuthenticatedUser();
  let result = await fetchAllTheGraphPages(async (first, skip) => {
    const pageResult = await theGraphClientStarterkits.request(MyAssets, { accountId: user.wallet, first, skip });
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
